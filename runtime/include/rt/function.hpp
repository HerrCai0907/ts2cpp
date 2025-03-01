#pragma once

#include "rt/gc.hpp"
#include <tuple>

namespace ts::builtin {

template <class Ret, class... Args> struct Function : public GcObject {
  using ret = Ret;
  using args = std::tuple<Args...>;

  auto operator()(Args... args) -> Ret;

  template <class Fn> Function(Fn &&) {}

  void ts_builtin_gc_visit_all_children() const override {}
};

template <class Ret, class... Args> struct FunctionRef {
  using pointee_type = Function<Ret, Args...>;
  pointee_type *m_pointer;

  Ret operator()(Args... args) const { return m_pointer->operator()(args...); }
};

template <class Ret, class... Args> using ts_func_t = FunctionRef<Ret, Args...>;

} // namespace ts::builtin
