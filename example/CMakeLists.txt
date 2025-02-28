aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR} example_src)

add_executable(ts_example
    ${example_src}
)

target_link_libraries(ts_example PUBLIC ts_rt)
