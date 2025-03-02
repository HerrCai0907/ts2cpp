#pragma once

#include "rt/basic_type.hpp"
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

template <IsGcObject T> struct GcRef {
  using pointee_type = T;
  pointee_type *m_pointer;

  pointee_type operator->() const noexcept { return m_pointer; }
};

template <class T>
concept IsGcRef = requires {
  typename T::pointee_type;
  requires IsGcObject<typename T::pointee_type>;
};
template <class T> struct is_gc_ref : public std::false_type {};
template <IsGcRef T> struct is_gc_ref<T> : public std::true_type {};
template <class T> static constexpr bool is_gc_ref_v = is_gc_ref<T>::value;

template <class T>
concept IsTsType = IsGcRef<T> || std::is_same_v<T, ts_number>;

template <IsTsType T> void gc_visit(T obj) {
  if constexpr (is_gc_ref_v<T>) {
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

  template <IsGcRef T> T set_return_value(T obj) noexcept {
    set_return_value_impl(obj.m_pointer);
    return obj;
  }

private:
  void set_return_value_impl(GcObject *obj) noexcept;
};

template <IsTsType T> T store_return(StackManager &manager, T return_value) {
  if constexpr (is_gc_ref_v<T>) {
    return manager.set_return_value(return_value);
  } else {
    // normal type, ignore
  }
  return return_value;
}

template <IsTsType T, class... Args> T gc_create_object(Args &&...args) {
  using E = typename T::pointee_type;
  return T{new E(std::forward<Args>(args)...)};
}

} // namespace ts::builtin
