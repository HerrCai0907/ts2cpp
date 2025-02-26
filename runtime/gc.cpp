#include "rt/gc.hpp"

namespace ts_builtin {

void Root::push(GcRef const &ref) noexcept {
  m_shadowstack[m_index] = ref;
  m_index++;
}

} // namespace ts_builtin
