cmake_minimum_required(VERSION 3.20)
project(ts_builtin)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)


add_library(ts_builtin
  gc.cc
)

target_compile_options(ts_builtin PRIVATE -fmodules-ts)