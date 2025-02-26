cmake_minimum_required(VERSION 3.20)
project(ts_builtin)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/runtime rt_src)

add_library(ts_rt
  ${rt_src}
)

target_include_directories(ts_rt PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/runtime/include)

if(${CMAKE_SOURCE_DIR} STREQUAL ${CMAKE_CURRENT_SOURCE_DIR})
  add_subdirectory(example)
endif()
