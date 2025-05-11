import { StateCreator, create } from 'zustand'
import { PersistOptions, persist } from 'zustand/middleware'
import { createClient } from '@/utils/supabase/client'
import type { CartItem, Product } from '@/types/database'

interface CartState {
  items: (CartItem & { product: Product })[]
  isLoading: boolean
  subtotal: number
  total: number
  itemCount: number
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncCart: () => Promise<void>
}

type CartStore = CartState & CartActions

type CartPersist = (
  config: StateCreator<CartStore>,
  options: PersistOptions<CartStore>
) => StateCreator<CartStore>

const supabase = createClient()

export const useCart = create<CartStore>()(
  (persist as CartPersist)(
    (set: (state: Partial<CartStore> | ((state: CartStore) => CartStore)) => void, get: () => CartStore) => ({
      items: [],
      isLoading: false,
      subtotal: 0,
      total: 0,
      itemCount: 0,

      addItem: async (product: Product, quantity = 1) => {
        set({ isLoading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          const items = get().items

          // Check if item already exists in cart
          const existingItem = items.find((item: CartItem & { product: Product }) => item.product_id === product.id)

          if (existingItem) {
            // Update quantity if item exists
            await get().updateQuantity(product.id, existingItem.quantity + quantity)
          } else {
            // Add new item if it doesn't exist
            if (user) {
              // Add to database if user is logged in
              const { error } = await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: product.id,
                  quantity,
                })

              if (error) throw error
            }

            // Add to local state
            const newItem: CartItem & { product: Product } = {
              id: crypto.randomUUID(),
              user_id: user?.id || '',
              product_id: product.id,
              quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              product,
            }

            set((state: CartStore) => ({
              ...state,
              items: [...state.items, newItem],
              subtotal: state.subtotal + (product.price * quantity),
              total: state.subtotal + (product.price * quantity),
              itemCount: state.itemCount + quantity,
            }))
          }
        } catch (error) {
          console.error('Error adding item to cart:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          const items = get().items
          const itemToRemove = items.find((item: CartItem & { product: Product }) => item.product_id === productId)

          if (!itemToRemove) return

          if (user) {
            // Remove from database if user is logged in
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', productId)

            if (error) throw error
          }

          // Remove from local state
          set((state: CartStore) => ({
            ...state,
            items: state.items.filter((item: CartItem & { product: Product }) => item.product_id !== productId),
            subtotal: state.subtotal - (itemToRemove.product.price * itemToRemove.quantity),
            total: state.subtotal - (itemToRemove.product.price * itemToRemove.quantity),
            itemCount: state.itemCount - itemToRemove.quantity,
          }))
        } catch (error) {
          console.error('Error removing item from cart:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        set({ isLoading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          const items = get().items
          const itemToUpdate = items.find((item: CartItem & { product: Product }) => item.product_id === productId)

          if (!itemToUpdate) return

          if (user) {
            // Update in database if user is logged in
            const { error } = await supabase
              .from('cart_items')
              .update({ quantity })
              .eq('user_id', user.id)
              .eq('product_id', productId)

            if (error) throw error
          }

          // Update local state
          set((state: CartStore) => ({
            ...state,
            items: state.items.map((item: CartItem & { product: Product }) =>
              item.product_id === productId
                ? { ...item, quantity }
                : item
            ),
            subtotal: state.subtotal - (itemToUpdate.product.price * itemToUpdate.quantity) + (itemToUpdate.product.price * quantity),
            total: state.subtotal - (itemToUpdate.product.price * itemToUpdate.quantity) + (itemToUpdate.product.price * quantity),
            itemCount: state.itemCount - itemToUpdate.quantity + quantity,
          }))
        } catch (error) {
          console.error('Error updating cart item quantity:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      clearCart: async () => {
        set({ isLoading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Clear database if user is logged in
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)

            if (error) throw error
          }

          // Clear local state
          set({
            items: [],
            subtotal: 0,
            total: 0,
            itemCount: 0,
            isLoading: false,
          })
        } catch (error) {
          console.error('Error clearing cart:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      syncCart: async () => {
        set({ isLoading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            // If no user is logged in, keep using local state
            return
          }

          // Fetch user's cart from database
          const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('user_id', user.id)

          if (error) throw error

          if (!cartItems) return

          // Calculate totals
          const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
          const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

          // Update local state
          set({
            items: cartItems as (CartItem & { product: Product })[],
            subtotal,
            total: subtotal,
            itemCount,
            isLoading: false,
          })
        } catch (error) {
          console.error('Error syncing cart:', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'cart-storage',
      // Only persist items and totals
      partialize: (state: CartStore) => ({
        items: state.items,
        subtotal: state.subtotal,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
) 