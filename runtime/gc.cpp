#include "rt/gc.hpp"

namespace ts_builtin {

Root gc_root;

GcObject::GcObject() noexcept { gc_root.push(this); }

void GcObject::ts_builtin_gc_visit() {
  this->m_color = gc_root.m_color;
  ts_builtin_gc_visit_all_children();
}

StackManager::StackManager() noexcept
    // remaining space in shadowstack for return value
    : m_frame_pointer(gc_root.m_index) {}

void StackManager::set_return_value_impl(GcObject *obj) noexcept {
  this->m_has_return_value = true;
  gc_root.m_shadowstack[this->m_frame_pointer] = obj;
}

StackManager::~StackManager() noexcept {
  // TODO: smarter decide whether we need to collect garbage
  size_t const new_frame_pointer =
      m_frame_pointer + (m_has_return_value ? 1 : 0);
  // we visit all objects which still exist in the shadowstack and mark children
  for (size_t i = 0; i < new_frame_pointer; i++) {
    gc_root.m_shadowstack[i]->ts_builtin_gc_visit_all_children();
  }
  // clean not visited node

  for (size_t i = new_frame_pointer; i < gc_root.m_index; i++) {
    if (gc_root.m_shadowstack[i]->m_color != gc_root.m_color) {
      // never visited
      delete gc_root.m_shadowstack[i];
    }
  }
  gc_root.m_color = ~gc_root.m_color;
  gc_root.m_index = new_frame_pointer;
}

} // namespace ts_builtin
