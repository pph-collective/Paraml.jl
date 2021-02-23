module Paraml

import YAML

include("utils.jl")
include("check.jl")
include("parse.jl")

"""
    create_params(
        defn_path::AbstractString,
        param_paths...;
        error_on_unused::Bool = false,
        out_path::AbstractString = "",
    )

Entry function - given the path to the parameter definitions and files, parse and create a params dictionary.

The defn_path and param_paths can be either a single yaml file, or a directory containing yaml files.

# Arguments
- `defn_path`: path to the parameter definitions
- `param_paths...`: paths to parameter files or directories. The files will be merged in the passed order so that item 'a' in the first params will be overwritten by item 'a' in the second params.
- `out_path`: path to directory where computed params will be saved if passed
- `error_on_unused`: throw a hard error if there are unused parameters, otherwise warnings are only printed

# Returns
- dictionary with computed/validated model paramters with defaults filled in where needed
"""
function create_params(
    defn_path::AbstractString,
    param_paths...;
    error_on_unused::Bool = false,
    out_path::AbstractString = "",
)
    defs = build_yaml(defn_path)

    params = Dict{String,Any}()
    for param_path in param_paths
        cur_params = build_yaml(param_path)
        params = merge_rec(params, cur_params)
    end

    classes = parse_classes(defs, params)
    parsed = parse_params(defs, params; classes)

    if !isempty(out_path)
        @info "writing parsed params to $out_path"
        YAML.write_file(out_path, parsed)
    end

    @info "\nChecking for unused parameters..."
    num_unused = warn_unused_params(parsed, params)
    @info "$num_unused unused parameters found"
    if error_on_unused
        @assert num_unused == 0 "There are unused parameters passed to the parser (see print statements)"
    end

    return parsed
end

export create_params

end
