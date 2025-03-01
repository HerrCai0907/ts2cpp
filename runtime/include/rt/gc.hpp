#pragma once

#include <cassert>
#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <type_traits>
#include <utility>

#ifndef SHADOW_STACK_SIZE
#define SHADOW_STACK_SIZE 1024
#endif

namespace ts::builtin {

struct GcObject {
  uint32_t m_color = 0U;
  GcObject() noexcept;
  virtual ~GcObject() = default;
  virtual void ts_builtin_gc_visit_all_children() const = 0;
  void ts_builtin_gc_visit();
};

template <class T>
concept IsGcObject = std::is_base_of_v<GcObject, T>;

template <class T> void gc_visit(T obj) {
  if constexpr (std::is_pointer_v<T>) {
    static_assert(std::is_base_of_v<GcObject, std::remove_pointer_t<T>>,
                  "gc only support GcObject*");
    obj->ts_builtin_gc_visit();
  } else {
    // normal type, ignore
  }
}

struct Root {
  GcObject *m_shadowstack[SHADOW_STACK_SIZE];
  size_t m_index = 0U;
  uint32_t m_color = 0U;

  void push(GcObject *ref) noexcept {
    assert(m_index < SHADOW_STACK_SIZE && "stack overflow");
    m_shadowstack[m_index] = ref;
    m_index++;
  }
};
extern Root gc_root;

struct StackManager {
  size_t m_frame_pointer;
  bool m_has_return_value = false;
  StackManager() noexcept;
  ~StackManager() noexcept;

  template <IsGcObject T> T *set_return_value(T *obj) noexcept {
    static_assert(std::is_base_of_v<GcObject, std::remove_pointer_t<T>>,
                  "gc only support GcObject*");
    set_return_value_impl(obj);
    return obj;
  }

private:
  void set_return_value_impl(GcObject *obj) noexcept;
};

template <class T> T store_return(StackManager &manager, T return_value) {
  if constexpr (std::is_pointer_v<T>) {
    static_assert(std::is_base_of_v<GcObject, std::remove_pointer_t<T>>,
                  "gc only support GcObject*");
    return manager.set_return_value(return_value);
  } else {
    // normal type, ignore
  }
  return return_value;
}

template <class T, class... Args> T create_object(Args &&...args) {
  // FIXME: alias two cast
  if constexpr (std::is_pointer_v<T>) {
    using E = std::remove_pointer_t<T>;
    static_assert(std::is_base_of_v<GcObject, E>, "gc only support GcObject");
    return new E(std::forward<Args>(args)...);
  } else {
    using E = typename T::pointee_type;
    return T{new E(std::forward<Args>(args)...)};
  }
}

} // namespace ts::builtin
