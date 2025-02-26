aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR} example_src)

add_library(ts_example
    ${example_src}
)

target_link_directories(ts_example PUBLIC ts_rt)

target_include_directories(ts_example PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../runtime/include)
