aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR} rt_src)

add_library(ts_rt
    STATIC
    ${rt_src}
)

target_include_directories(ts_rt PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
