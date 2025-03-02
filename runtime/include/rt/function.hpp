#pragma once

#include "rt/gc.hpp"

namespace ts::builtin {

template <class Ret, class... Args> struct Function : public GcObject {
  using FnType = Ret (*)(Args...);
  FnType m_fn;

  Function(FnType fn) : m_fn(fn) {}

  auto operator()(Args... args) -> Ret { return m_fn(args...); }

  void ts_builtin_gc_visit_all_children() const override {}
};

template <class Ret, class... Args>
struct FunctionRef : public GcRef<Function<Ret, Args...>> {
  Ret operator()(Args... args) const {
    return (*this->GcRef<Function<Ret, Args...>>::m_pointer)(args...);
  }
};

template <class Ret, class... Args> using ts_func_t = FunctionRef<Ret, Args...>;

} // namespace ts::builtin
