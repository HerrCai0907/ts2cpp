#pragma once

#include "rt/gc.hpp"
#include <tuple>

namespace ts::builtin {

template <class Ret, class... Args> struct ts_func : public GcObject {
  using ret = Ret;
  using args = std::tuple<Args...>;
  using type = ts_func *;

  auto operator()(Args... args) -> Ret;
};

template <class Ret, class... Args>
using ts_func_t = typename ts_func<Ret, Args...>::type;

} // namespace ts::builtin
