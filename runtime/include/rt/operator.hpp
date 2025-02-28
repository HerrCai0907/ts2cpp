#pragma once

namespace ts_builtin {

template <class L, class R> auto binary_operator_plus(L lhs, R rhs) {
  return lhs + rhs;
}

} // namespace ts_builtin
