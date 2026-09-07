import { reactive, ref, watch } from 'vue'
import { userService, type UserInput } from '@/services/user.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import type { AdminUser, ApiError } from '@/types'

export function useAdminUsers() {
  const toast = useToastStore()
  const session = useUserStore()
  const items = ref<AdminUser[]>([])
  const total = ref(0)
  const pages = ref(1)
  const page = ref(1)
  const q = ref('')
  const role = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const editing = ref<AdminUser | null>(null)
  const showForm = ref(false)
  const form = reactive<UserInput>({ email: '', password: '', name: '', phone: '', accountType: 'customer' })

  async function load() {
    loading.value = true
    try {
      const r = await userService.list({ q: q.value, accountType: role.value, page: page.value })
      items.value = r.items
      total.value = r.total
      pages.value = r.pages
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  watch(q, () => {
    clearTimeout(timer)
    timer = setTimeout(() => ((page.value = 1), load()), 350)
  })
  watch(role, () => ((page.value = 1), load()))
  watch(page, load, { immediate: true })

  function openNew() {
    editing.value = null
    Object.assign(form, { email: '', password: '', name: '', phone: '', accountType: 'customer' })
    showForm.value = true
  }

  function openEdit(u: AdminUser) {
    editing.value = u
    Object.assign(form, {
      email: u.email,
      password: '',
      name: u.name,
      phone: u.phone,
      accountType: u.accountType as 'admin' | 'customer',
    })
    showForm.value = true
  }

  async function save() {
    saving.value = true
    try {
      if (editing.value) {
        const payload: UserInput = { name: form.name, phone: form.phone, accountType: form.accountType }
        if (form.password) payload.password = form.password
        const updated = await userService.update(editing.value.id, payload)
        items.value = items.value.map((u) => (u.id === updated.id ? updated : u))
        toast.success('Usuario actualizado')
      } else {
        const created = await userService.create(form)
        items.value.unshift(created)
        total.value += 1
        toast.success('Usuario creado')
      }
      showForm.value = false
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      const updated = await userService.update(u.id, { isActive: !u.isActive })
      items.value = items.value.map((x) => (x.id === updated.id ? updated : x))
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  async function remove(u: AdminUser) {
    try {
      await userService.remove(u.id)
      items.value = items.value.filter((x) => x.id !== u.id)
      total.value -= 1
      toast.success(`${u.email} eliminado`)
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  const isMe = (u: AdminUser) => u.id === session.user?.id

  return { items, total, pages, page, q, role, loading, saving, editing, showForm, form, openNew, openEdit, save, toggleActive, remove, isMe }
}
