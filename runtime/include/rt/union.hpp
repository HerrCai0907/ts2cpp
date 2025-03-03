#pragma once

#include "rt/gc.hpp"
#include <algorithm>
#include <cassert>
#include <cstddef>
#include <limits>
#include <type_traits>
#include <utility>

namespace ts::builtin {

namespace union_type::detail {
template <class... Args> struct MaxSize {
  static constexpr std::size_t value = std::max({sizeof(Args)...});
};
template <std::size_t I, class T, class F, class... Args> struct FindImpl {
  static constexpr std::size_t value =
      std::is_same_v<T, F> ? I : FindImpl<I + 1, T, Args...>::value;
};
template <std::size_t I, class T, class F> struct FindImpl<I, T, F> {
  static constexpr std::size_t value =
      std::is_same_v<T, F> ? I : std::numeric_limits<std::size_t>::max();
};
template <class T, class... Args> struct Find {
  static constexpr std::size_t value = FindImpl<0, T, Args...>::value;
};
} // namespace union_type::detail

template <class... Args> struct union_type_t : public GcObject {
  std::size_t m_kind{-1U};
  std::byte m_storage[union_type::detail::MaxSize<Args...>::value];
  union_type_t() {}
  template <class T> union_type_t(T &&t) {
    constexpr std::size_t index = union_type::detail::Find<T, Args...>::value;
    static_assert(index != std::numeric_limits<std::size_t>::max(), "");
    m_kind = index;
    new (&m_storage) T(std::forward<T>(t));
  }
  template <class T> operator T() {
    constexpr std::size_t index = union_type::detail ::Find<T, Args...>::value;
    static_assert(index != -1, "");
    assert(m_kind == index);
    return *reinterpret_cast<T *>(&m_storage[0]);
  }
  void ts_builtin_gc_visit_all_children() const override {
    (try_gc_visit<Args>(*reinterpret_cast<const Args *>(&m_storage[0])), ...);
  }

private:
  template <class T> void try_gc_visit(T const &value) const {
    constexpr std::size_t index = union_type::detail ::Find<T, Args...>::value;
    static_assert(index != -1, "");
    if (m_kind == index) {
      gc_visit<T>(value);
    }
  }
};

} // namespace ts::builtin
