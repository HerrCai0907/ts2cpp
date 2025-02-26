#pragma once

#include <type_traits>

namespace ts_builtin {

struct GcObject {
  virtual ~GcObject() = default;
  virtual void ts_gc_visit_all_children() const = 0;
};

struct Root {
  static Root &ins() {
    static Root ins{};
    return ins;
  }
  GcObject *m_shadowstack[1024];
  size_t m_index = 0U;

  void push(GcObject *ref) noexcept {
    m_shadowstack[m_index] = ref;
    m_index++;
  }
};

struct StackManagerRaii {
  size_t m_frame_pointer;
  StackManagerRaii() : m_frame_pointer(Root::ins().m_index) {}
  ~StackManagerRaii() { Root::ins().m_index = m_frame_pointer; }
};

template <class T>
concept IsGcObject = std::is_base_of_v<GcObject, T>;

template <IsGcObject T> T *create_object(T *ptr) {
  Root::ins().push(ptr);
  return ptr;
}

} // namespace ts_builtin
