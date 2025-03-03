#pragma once

#include "rt/gc.hpp"
#include <cstdint>

namespace ts {
using ts_void = void;
using ts_number = double;
struct ts_null {};
} // namespace ts

namespace ts::builtin {

using size_t = uint32_t;

template <class T> struct ts_type {
  using type = GcRef<T>;
};
template <> struct ts_type<ts_number> {
  using type = ts_number;
};
template <> struct ts_type<ts_void> {
  using type = ts_void;
};

template <class T> using ts_type_t = typename ts_type<T>::type;

} // namespace ts::builtin
