"""
Get and check item from the params, falling back on the definitions default.
"""
function get_item(key, def, key_path, param, classes)
    @debug "parsing $key_path ..."

    if haskey(param, key)
        return check_item(param[key], def, key_path; classes)
    else
        return def["default"]
    end
end

"""
Get the bin key as an integer, or error if it is not convertable.
"""
get_bin_int(i::Int) = i
function get_bin_int(s)
    try
        return parse(Int, s)
    catch
        error("Bins must be integers")
    end
end

"""
Get and validate a type == bin definition
"""
function get_bins(key, def, key_path, param, classes)
    @debug "parsing $key_path ..."

    if !haskey(param, key)
        return def["default"]
    end

    bins = merge_rec(def["default"], param[key])

    parsed_bins = Dict()
    for (bin, val) in bins
        bin_int = get_bin_int(bin)

        for (field, defn) in def["fields"]
            @assert haskey(val, field) "$field must be in $val [$key_path.$bin]"
            val[field] = check_item(val[field], defn, "$key_path.$bin.$field"; classes)
        end

        parsed_bins[bin_int] = val
    end

    return parsed_bins
end


"""
Get and validate a type == definition definition
"""
function get_defn(key, def, key_path, param, classes)
    @debug "parsing $key_path ..."

    if !haskey(param, key) || param[key] == Dict()
        parsed = def["default"]
    else
        parsed = param[key]
    end

    for (k, val) in parsed
        for (field, defn) in def["fields"]
            if !haskey(val, field)
                if haskey(defn, "default")
                    val[field] = defn["default"]
                else # no key in param and no default available, error
                    @assert haskey(val, field) "$field must be in $val [$key_path]"
                end
            end
        end
    end

    return parsed
end

"""
Recursively parse the passed params, using the definitions to validate
and provide defaults.
"""
function parse_params(
    defs::AbstractDict,
    params::AbstractDict;
    key_path::String = "",
    classes::AbstractDict = Dict(),
)
    @debug "parsing $key_path ..."

    # handles case of bin or def as direct default item
    if haskey(defs, "default")
        if defs["type"] == "bin"
            return get_bins("dummy", defs, key_path, Dict("dummy" => params), classes)
        else
            defs["type"] == "definition"
            return get_defn("dummy", defs, key_path, Dict("dummy" => params), classes)
        end
    end

    parsed = Dict()
    # all v are dicts at this point
    for (k, def) in defs
        kp = "$key_path.$k"
        if haskey(def, "default")
            dtype = def["type"]
            if dtype == "sub-dict"
                parsed[k] = parse_subdict(
                    def["default"],
                    def["keys"],
                    get(params, k, Dict()),
                    kp,
                    classes,
                )
            elseif dtype == "bin"
                parsed[k] = get_bins(k, def, kp, params, classes)
            elseif dtype == "definition"
                parsed[k] = get_defn(k, def, kp, params, classes)
            else
                parsed[k] = get_item(k, def, kp, params, classes)
            end
        else
            parsed[k] = parse_params(def, get(params, k, Dict()); key_path = kp, classes)
        end
    end

    return parsed
end

# params is a scalar, return it
parse_params(
    defs::AbstractDict,
    params;
    key_path::String = "",
    classes::AbstractDict = Dict(),
) = params

"""
Parse a type == sub-dict definition
"""
function parse_subdict(default, keys, params, key_path, classes)
    @debug "parsing $key_path ..."

    parsed = Dict()
    key, rem_keys = headtail(keys...)
    for val in keys_or_vals(classes[key])
        kp = "$key_path.$val"
        val_params = get(params, val, Dict())
        parsed[val] = parse_params(default, val_params; key_path = kp, classes)
        if length(rem_keys) > 0
            merge!(parsed[val], parse_subdict(default, rem_keys, val_params, kp, classes))
        end
    end

    return parsed
end


"""
Parse the classes definition first as it is needed in parsing the full params.
"""
function parse_classes(defs::AbstractDict, params::AbstractDict)
    if "classes" in keys(defs)
        return parse_params(defs["classes"], get(params, "classes", Dict()))
    else
        return Dict()
    end
end
