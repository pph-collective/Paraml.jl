"""
Recursively merge two nested dictionaries
"""
function merge_rec(a::AbstractDict, b::AbstractDict)
    d = Dict()
    for (k, v) in a
        if haskey(b, k)
            d[k] = merge_rec(v, b[k])
        else
            d[k] = v
        end
    end

    for (k, v) in b
        if !haskey(a, k)
            d[k] = v
        end
    end

    return d
end

merge_rec(a, b) = b

"""
Read in a yaml or folder of yamls into a dictionary.
"""
function build_yaml(path::AbstractString)
    yml = Dict{String,Any}()
    if isdir(path)
        for file in readdir(path; join = true)
            if endswith(file, r"\.ya?ml")
                this_yml = YAML.load_file(file)
                merge!(yml, this_yml)
            end
        end
    else
        @assert endswith(path, r"\.ya?ml") "Must provide a yaml file"
        yml = YAML.load_file(path)
    end

    return yml
end

"""
Get the head and tail tuples from args
"""
headtail(a, b...) = (a, b)


"""
Compare the original params to what was parsed and print warnings for any original
params that are unused in the final parsed parasms.
"""
function warn_unused_params(parsed::AbstractDict, params::AbstractDict; key_path = "")
    count = 0

    for (k, v) in params
        kp = "$key_path.$k"
        if haskey(parsed, k)
            count += warn_unused_params(parsed[k], params[k]; key_path = kp)
        else
            @warn "[$kp] is unused"
            count += 1
        end
    end

    return count
end

# neither is a dict
warn_unused_params(parsed, params; key_path = "") = 0

# one is a dict
function warn_unused_params(parsed, params::AbstractDict; key_path = "")
    @warn "[$key_path] has unused params: $params"
    return 1
end
function warn_unused_params(parsed::AbstractDict, params; key_path = "")
    @warn "[$key_path] has sub-keys, got unused params: $params"
    return 1
end

"""
Get the keys of a dict, or the items in a list.
"""
keys_or_vals(d::AbstractDict) = collect(keys(d))
keys_or_vals(a::AbstractArray) = a
