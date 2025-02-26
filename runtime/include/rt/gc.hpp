#pragma once

#include <type_traits>

namespace ts_builtin {

struct GcObject {
  virtual ~GcObject() = default;
  virtual void visit() = 0;
};

struct GcRef {
  GcObject *m_data;
};

struct Root {
  static Root &ins() {
    static Root ins{};
    return ins;
  }
  GcRef m_shadowstack[1024];
  size_t m_index = 0U;

  void push(GcRef const &ref) noexcept;
};

struct StackManagerRaii {
  size_t m_frame_pointer;
  StackManagerRaii() : m_frame_pointer(Root::ins().m_index) {}
  ~StackManagerRaii() { Root::ins().m_index = m_frame_pointer; }
};

template <class T>
concept IsGcObject = std::is_base_of_v<GcObject, T>;

template <IsGcObject T> GcRef create_object(T *ptr) {
  GcRef ref{.m_data = ptr};
  Root::ins().push(ref);
  return ref;
}

} // namespace ts_builtin
