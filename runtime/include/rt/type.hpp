#pragma once

#include <cstdint>
#include <tuple>

using ts_void = void;
using ts_number = double;

namespace ts_builtin {

using size_t = uint32_t;

template <class T> struct ts_type {
  using type = T *;
};
template <> struct ts_type<ts_number> {
  using type = ts_number;
};
template <> struct ts_type<ts_void> {
  using type = ts_void;
};

template <class T> using ts_type_t = typename ts_type<T>::type;

template <class Ret, class... Args> struct ts_func_type {
  using ret = Ret;
  using args = std::tuple<Args...>;
};

} // namespace ts_builtin
