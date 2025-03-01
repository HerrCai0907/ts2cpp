#pragma once

#include <iostream>
#include <utility>

namespace ts {

struct Console {
  template <class... Args> void ts_log(Args &&...args) {
    ((std::cout << std::forward<Args>(args) << ' '), ...) << "\n";
  }
  template <class... Args> void ts_debug(Args &&...args) {
    ((std::cout << std::forward<Args>(args) << ' '), ...) << "\n";
  }
  template <class... Args> void ts_info(Args &&...args) {
    ((std::cerr << std::forward<Args>(args) << ' '), ...) << "\n";
  }
  template <class... Args> void ts_warn(Args &&...args) {
    ((std::cerr << std::forward<Args>(args) << ' '), ...) << "\n";
  }
  template <class... Args> void ts_error(Args &&...args) {
    ((std::cerr << std::forward<Args>(args) << ' '), ...) << "\n";
  }
};

extern Console *ts_console;

} // namespace ts
