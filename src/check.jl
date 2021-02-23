check_int(i::Int, key_path) = i
function check_int(o, key_path)
    try
        convert(Int, o)
    catch
        throw(AssertionError("$o must be an integer [$key_path]"))
    end
end

check_float(f::Float64, key_path) = f
function check_float(o, key_path)
    try
        convert(Float64, o)
    catch
        throw(AssertionError("$o must be a float [$key_path]"))
    end
end

check_boolean(b::Bool, key_path) = b
function check_boolean(o, key_path)
    try
        convert(Bool, o)
    catch
        throw(AssertionError("$o must be a boolean [$key_path]"))
    end
end

function check_array(val::AbstractArray, values::AbstractArray, key_path)
    if !issubset(val, values)
        throw(AssertionError("$val not in $values [$key_path]"))
    end
end
check_array(val, values::AbstractArray, key_path) =
    throw(AssertionError("$val must be an array (subset of $values) [$key_path]"))

function get_values(def, classes)
    if haskey(def, "values")
        return def["values"]
    elseif haskey(def, "class")
        return keys_or_vals(classes[def["class"]])
    else
        throw(AssertionError("array type definitions must specify `values` or `class`"))
    end
end

"""
Checks if an item meets the requirements of the field's definition.
"""
function check_item(val, def, key_path; keys = nothing, classes = nothing)
    # check type of value
    dtype = def["type"]
    if dtype == "int"
        val = check_int(val, key_path)
    elseif dtype == "float"
        val = check_float(val, key_path)
    elseif dtype == "boolean"
        val = check_boolean(val, key_path)
    elseif dtype == "enum"
        values = get_values(def, classes)
        @assert val in values "$val not in $values [$key_path]"
    elseif dtype == "array"
        values = get_values(def, classes)
        check_array(val, values, key_path)
    elseif dtype == "keys"
        check_array(val, keys, key_path)
    end

    # check range
    if haskey(def, "min")
        @assert val >= def["min"] "$val must be greater than $(def["min"]) [$key_path]"
    end
    if haskey(def, "max")
        @assert val <= def["max"] "$val must be less than $(def["max"]) [$key_path]"
    end

    return val
end
