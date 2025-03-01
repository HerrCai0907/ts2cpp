#pragma once

namespace ts::builtin {

template <class L, class R> auto binary_operator_plus(L lhs, R rhs) {
  return lhs + rhs;
}

} // namespace ts::builtin
