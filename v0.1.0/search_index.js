var documenterSearchIndex = {"docs":
[{"location":"","page":"Home","title":"Home","text":"CurrentModule = Paraml","category":"page"},{"location":"#Paraml","page":"Home","title":"Paraml","text":"","category":"section"},{"location":"#Table-of-Contents","page":"Home","title":"Table of Contents","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Paraml\nTable of Contents\nMotivation\nGetting Started\nInstallation\nRunning Paraml\nParameter Definition\nRequired Keys\nTypes\nint\nfloat\nboolean\narray\nenum\nany\nbin\nsub-dict\ndefinition\nkeys\nUsing Classes\nAPI","category":"page"},{"location":"#Motivation","page":"Home","title":"Motivation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Paraml is a spinoff of TITAN, an agent based model.  We have a number of parameters in that model, many of which are not used in a given run. Paraml addresses the following pain points we had:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Parameters often weren't formally defined/described anywhere - some had comments, some were hopefully named idiomatically. This caused issues onboarding new people to using the model.\nParameters were statically defined/hard coded, but we often wanted them to be dynamic.\nParameters needed to be filled out/defined by non-technical researchers: users shouldn't need to know how to code to create a parameter file.\nParameters need to have specific validation (e.g. a probability should be between 0 and 1, only a or b are expected values for parameter y). This was typically a run time failure - sometimes silent, sometimes explosive.\nIf a user isn't using a feature of the model, they shouldn't have to worry about/carry around its parameters.\nReproducibility of the run is key - must be able to re-run the model with the same params.\nWe needed to be able to create common settings which described a specific world the model runs in and let users use those, but also override parameters as they needed for their run of the model.","category":"page"},{"location":"","page":"Home","title":"Home","text":"How Paraml addresses these:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Parameter definitions require defaults\nCan add inline descriptions of parameters\nA small type system allows validation of params, as well as flexibility to define interfaces for params\nParameter files only need to fill in what they want different from the defaults\nCan save off the fully computed params, which can then be re-used at a later date\nCan layer different parameter files, allowing more complex defaults and re-use of common scenarios","category":"page"},{"location":"#Getting-Started","page":"Home","title":"Getting Started","text":"","category":"section"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"] add Paraml","category":"page"},{"location":"#Running-Paraml","page":"Home","title":"Running Paraml","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The entrypoint for running Paraml is Paraml.create_params.  This takes the parameter definitions, parameter files, and some options and returns a dictionary of the validated and computed parameters.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Args:","category":"page"},{"location":"","page":"Home","title":"Home","text":"def_path: A yaml file or directory of yaml files containing the parameter definitions (see Parameter Definition).\nparam_paths...: The remaining args are interpreted as parameter files.  They will be merged in order (last merged value prevails).\nout_path: Optional, if passed, save the computed parameters as a yaml to this location.\nerror_on_unused: Optional, if True throw an exception if there are parameters in param_paths that do not have a corresponding definition in the def_path definitions.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Returns:","category":"page"},{"location":"","page":"Home","title":"Home","text":"A dictionary representing the parsed parameters.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Paraml\n\ndef_path = \"my/params/dir\" # directory of the params definition files\nbase_params = \"base/params.yaml\" # file location of the first params\nsetting_param = \"settings/my_setting\" # directory of the second params files\nintervention_params = \"intervention/params\" # directory of the third params files\nout_path = \"./params.yml\" # location to save computed params to\n\nparams = create_params(\n  def_path,\n  base_params,\n  setting_params,\n  intervention_params;\n  out_path,\n  error_on_unused=true # if parameters are passed, but don't exist in the definition file, error\n)","category":"page"},{"location":"#Parameter-Definition","page":"Home","title":"Parameter Definition","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The parameter definition language (PDL) provides expressions for defining input types, creation of types for the target application, and simple validation of input values.  The PDL itself is YAML and can be defined either in one file or a directory of yaml files. There can be multiple root keys in the parameter definition to namespace parameters by topic, and parameter definitions can be deeply nested for further organization of the params.  Only the classes key at the root of the definitions has special meaning (see Using Classes).","category":"page"},{"location":"","page":"Home","title":"Home","text":"An example params definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"# classes is a special parameter key that allows the params defined as sub-keys\n# to be used in definitions for other sections\nclasses:\n  animals:\n    type: definition\n    description: Animals included in model\n    fields:\n      goes:\n        type: any\n        description: What noise does the animal make?\n        default: oink\n      is_mammal:\n        type: boolean\n        description: Is this animal a mammal\n        default: false\n      friends_with:\n        type: keys\n        description: What animals does this animal befriend\n    default:\n      cat:\n        goes: meow\n        is_mammal: true\n        friends_with:\n          - cat\n          - dog\n      dog:\n        goes: woof\n        is_mammal: true\n        friends_with:\n          - dog\n          - turtle\n          - cat\n      turtle:\n        goes: gurgle\n        friends_with:\n          - dog\n          - turtle\n  locations:\n    type: array\n    description: Where do the animals live?\n    default:\n      - barn\n      - ocean\n    values:\n      - barn\n      - ocean\n      - sky\n      - woods\n\n# demographics is another root-level parameter, which facets off of the values in classes\n# then has parameter definitions for each of those combinations\ndemographics:\n  type: sub-dict\n  description: Parameters controlling population class level probabilities and behaviors\n  keys:\n    - animals\n    - locations\n  default:\n    num:\n      type: int\n      default: 0\n      description: Number of animals of this type at this location\n    prob_happy:\n      type: float\n      default: 1.0\n      description: Probability an animal is happy\n      min: 0.0\n      max: 1.0\n    flag: # parameter definitions can be nested in intermediate keys to group related items\n      color:\n        type: enum\n        default: blue\n        description: What's the color is the flag of this animal/location combo\n        values:\n          - blue\n          - indigo\n          - cyan\n      name:\n        type: any\n        default: animal land\n        description: What is the name of this animal/location combo's flag\n\n# neighbors is another root-level parameter\nneighbors:\n  type: definition\n  description: Definition of an edge (relationship) between two locations\n  fields:\n    location_1:\n      type: enum\n      default: barn\n      class: locations\n    location_2:\n      type: enum\n      default: sky\n      class: locations\n    distance:\n      type: float\n      default: 0\n      min: 0\n  default:\n    edge_default:\n      location_1: barn\n      location_2: sky\n      distance: 1000\n","category":"page"},{"location":"","page":"Home","title":"Home","text":"An example of parameters for the definition above","category":"page"},{"location":"","page":"Home","title":"Home","text":"classes:\n  animals:\n    pig: # doesn't need a `goes` key as the default is oink and that is appropriate\n      is_mammal: true\n      friends_with:\n        - pig\n    fish: # fish don't need to specify `is_mammal` as false as that is the default\n      goes: glugglug\n      friends_with:\n        - fish\n    wolf:\n      goes: ooooooooo\n      is_mammal: true\n      friends_with:\n        - pig\n  locations:\n    - ocean\n    - woods\n    - barn\n\n# the calculated params will fill in the default values for combinations of\n# animals/colors/parameters that aren't specified below\ndemographics:\n  pig:\n    barn:\n      num: 20\n      flag:\n        color: cyan\n        name: piney porcines\n  wolf:\n    woods:\n      num: 1\n      prob_happy: 0.8\n      flag:\n        name: running solo\n  fish:\n    ocean:\n      num: 1000001\n      prob_happy: 0.4\n      flag:\n        color: indigo\n        name: cool school\n\n# we're defining a edges in a graph in this example, the names are labels for human readability only\nneighbors:\n  woodsy_barn:\n    location_1: woods\n    location_2: barn\n    distance: 1\n  woodsy_ocean:\n    location_1: woods\n    location_2: ocean\n    distance: 3\n  barn_ocean:\n    location_1: barn\n    location_2: ocean\n    distance: 4","category":"page"},{"location":"","page":"Home","title":"Home","text":"Parameters are defined as key value pairs (typically nested).  There are some reserved keys that allow for definition of a parameter item, but otherwise a key in the parameter definition is interpreted as an expected key in the parameters.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The reserved keys used for defining parameters are:","category":"page"},{"location":"","page":"Home","title":"Home","text":"type\ndefault\ndescription\nmin\nmax\nvalues\nfields","category":"page"},{"location":"","page":"Home","title":"Home","text":"Specifically, if the default key is present in a yaml object, then that object will be interpreted as a parameter definition.  The other keys are used in that definition","category":"page"},{"location":"","page":"Home","title":"Home","text":"For example, in the below type is used as a parameter key, which is allowed (though perhaps not encouraged for readability reasons) as default is not a key at the same level of type.  The second usage of type is interpreted as the definition of type (the key) being an int.","category":"page"},{"location":"","page":"Home","title":"Home","text":"a:\n  type:\n    type: int\n    default: 0\n    description: the type of a","category":"page"},{"location":"","page":"Home","title":"Home","text":"classes is also reserved as a root key (see using classes below)","category":"page"},{"location":"#Required-Keys","page":"Home","title":"Required Keys","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Every parameter item must have the type, and default keys (description highly encouraged, but not required).","category":"page"},{"location":"","page":"Home","title":"Home","text":"See Types for more information on the types and how they interact with the other keys.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The default key should be a valid value given the rest of the definition.  The default key can include parameter definitions within it.  This is common with sub-dict param definitions.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The description is a free text field to provide context for the parameter item.  This can also be used to generate documentation (no automated support at this time - see TITAN's params app as an example).","category":"page"},{"location":"#Types","page":"Home","title":"Types","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The type of a parameter definition dictates which other fields are required/used when parsing the definition.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The types supported by Paraml are:","category":"page"},{"location":"","page":"Home","title":"Home","text":"int\nfloat\nboolean\narray\nenum\nany\nbin\nsub-dict\ndefinition\nkeys","category":"page"},{"location":"#int","page":"Home","title":"int","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter is expected to be an integer.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"min - the minimum value (inclusive) this parameter can take\nmax - the maximum value (inclusive) this parameter can take","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"fav_num:\n  type: int\n  default: 12\n  description: a is your favorite 3-or-fewer-digit number\n  min: -999\n  max: 999","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"fav_num: 13","category":"page"},{"location":"#float","page":"Home","title":"float","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter is expected to be a floating point number","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"min - the minimum value (inclusive) this parameter can take\nmax - the maximum value (inclusive) this parameter can take","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"heads_prob:\n  type: float\n  default: 0.5\n  description: the probability heads is flipped\n  min: 0.0\n  max: 1.0","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"heads_prob: 0.75","category":"page"},{"location":"#boolean","page":"Home","title":"boolean","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter is expected to be a true/false value","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"use_feature:\n  type: boolean\n  description: whether or not to use this feature\n  default: false","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"use_feature: true","category":"page"},{"location":"#array","page":"Home","title":"array","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter is expected to be an array of values selected from the defined list.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"values - either a list of strings that the parameter can take, or the name of a class whose values can be used","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"locations:\n  type: array\n  description: Where do the animals go?\n  default:\n    - barn\n    - ocean\n  values:\n    - barn\n    - ocean\n    - sky\n    - woods","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"locations:\n  - sky\n  - ocean","category":"page"},{"location":"#enum","page":"Home","title":"enum","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter is expected to be a single value selected from the defined list.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"values - either a list of strings that the parameter can take, or the name of a class whose values can be used","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"classes:\n  my_classes:\n    type: array\n    description: which class my params has\n    default:\n      - a\n      - b\n    values:\n      - a\n      - b\n      - c\n\naffected_class:\n  type: enum\n  default: a\n  description: which class is affected by this feature\n  values: my_classes","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"my_classes:\n  - b\n  - c\n\naffected_class: c","category":"page"},{"location":"#any","page":"Home","title":"any","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The value of the parameter can take on any value and will not be validated.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"name:\n  type: any\n  description: what is your name?\n  default: your name here","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"name: Paraml","category":"page"},{"location":"#bin","page":"Home","title":"bin","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Binned (integer) keys with set value fields.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"fields - parameter definitions for each required field in the binned items.  Because the sub-fields of a bin are required, no default can be provided.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"bins:\n  type: bin\n  description: Binned probabilities of frequencies\n  fields:\n    prob:\n      type: float\n      min: 0.0\n      max: 1.0\n    min:\n      type: int\n      min: 0\n    max:\n      type: int\n      min: 0\n  default:\n    1:\n      prob: 0.585\n      min: 1\n      max: 6\n    2:\n      prob: 0.701\n      min: 7\n      max: 12\n    3:\n      prob: 0.822\n      min: 13\n      max: 24","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"bins:\n  1:\n    prob: 0.5\n    min: 0\n    max: 10\n  2:\n    prob: 0.9\n    min: 11\n    max: 20","category":"page"},{"location":"#sub-dict","page":"Home","title":"sub-dict","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Build a set of params for each key combination listed.  Requires use of classes root key.  The default should contain parameter definition items.  Can facet on an arbitrary number of classes.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"keys - which params under the classes root key should be sub-dict'ed off of","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"classes:\n  my_classes:\n    type: array\n    description: which class my params has\n    default:\n      - a\n      - b\n    values:\n      - a\n      - b\n      - c\n\ndemographics:\n  type: sub-dict\n  description: parameters defining characteristics of each class\n  keys:\n    - my_classes\n  default:\n    num:\n      type: int\n      default: 0\n      description: number of agents in the class","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"demographics:\n  a:\n    num: 10\n  b:\n    num: 20","category":"page"},{"location":"#definition","page":"Home","title":"definition","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Define an item with the given interface.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"fields - the fields defining the interface for each defined item.  Each field is a param definition item.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"animals:\n  type: definition\n  description: Animals included in model\n  fields:\n    goes:\n      type: any\n      description: What noise does the animal make?\n      default: oink\n    is_mammal:\n      type: boolean\n      description: Is this animal a mammal\n      default: false\n    friends_with:\n      type: keys\n      desciption: What animals does this animal befriend\n  default:\n    cat:\n      goes: meow\n      is_mammal: true\n      friends_with:\n        - cat\n        - dog\n    dog:\n      goes: woof\n      is_mammal: true\n      friends_with:\n        - dog\n        - cat","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"animals:\n  sheep:\n    goes: bah\n    is_mammal: true\n    friends_with:\n      - pig\n      - sheep\n  pig:\n    is_mammal: true\n  fish:\n    goes: glugglug\n    friends_with:\n      - fish","category":"page"},{"location":"#keys","page":"Home","title":"keys","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Within the field definitions of a definition type, the keys type acts like an array type, but with the values limited to the keys that are ultimately definied in the params.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Required keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Optional keys:","category":"page"},{"location":"","page":"Home","title":"Home","text":"None","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example definition:","category":"page"},{"location":"","page":"Home","title":"Home","text":"animals:\n  type: definition\n  description: Animals included in model\n  fields:\n    goes:\n      type: any\n      description: What noise does the animal make?\n      default: oink\n    is_mammal:\n      type: boolean\n      description: Is this animal a mammal\n      default: false\n    friends_with:\n      type: keys\n      desciption: What animals does this animal befriend\n  default:\n    cat:\n      goes: meow\n      is_mammal: true\n      friends_with:\n        - cat\n        - dog\n    dog:\n      goes: woof\n      is_mammal: true\n      friends_with:\n        - dog\n        - cat","category":"page"},{"location":"","page":"Home","title":"Home","text":"Example usage:","category":"page"},{"location":"","page":"Home","title":"Home","text":"animals:\n  sheep:\n    goes: bah\n    is_mammal: true\n    friends_with:\n      - pig\n      - sheep\n  pig:\n    is_mammal: true\n  fish:\n    goes: glugglug\n    friends_with:\n      - fish","category":"page"},{"location":"#Using-Classes","page":"Home","title":"Using Classes","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The classes key as a root key of the parameter definitions takes on special meaning.  The parameters chosen in this section can be used to determine acceptable values in other sections of the params (via enum and array types), or to determine what params need to be created (via sub-dict type).","category":"page"},{"location":"#API","page":"Home","title":"API","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"","category":"page"},{"location":"","page":"Home","title":"Home","text":"Modules = [Paraml]","category":"page"},{"location":"#Paraml.build_yaml-Tuple{AbstractString}","page":"Home","title":"Paraml.build_yaml","text":"Read in a yaml or folder of yamls into a dictionary.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.check_item-Tuple{Any,Any,Any}","page":"Home","title":"Paraml.check_item","text":"Checks if an item meets the requirements of the field's definition.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.create_params-Tuple{AbstractString,Vararg{Any,N} where N}","page":"Home","title":"Paraml.create_params","text":"create_params(\n    defn_path::AbstractString,\n    param_paths...;\n    error_on_unused::Bool = false,\n    out_path::AbstractString = \"\",\n)\n\nEntry function - given the path to the parameter definitions and files, parse and create a params dictionary.\n\nThe defnpath and parampaths can be either a single yaml file, or a directory containing yaml files.\n\nArguments\n\ndefn_path: path to the parameter definitions\nparam_paths...: paths to parameter files or directories. The files will be merged in the passed order so that item 'a' in the first params will be overwritten by item 'a' in the second params.\nout_path: path to directory where computed params will be saved if passed\nerror_on_unused: throw a hard error if there are unused parameters, otherwise warnings are only printed\n\nReturns\n\ndictionary with computed/validated model paramters with defaults filled in where needed\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.get_bin_int-Tuple{Int64}","page":"Home","title":"Paraml.get_bin_int","text":"Get the bin key as an integer, or error if it is not convertable.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.get_bins-NTuple{5,Any}","page":"Home","title":"Paraml.get_bins","text":"Get and validate a type == bin definition\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.get_defn-NTuple{5,Any}","page":"Home","title":"Paraml.get_defn","text":"Get and validate a type == definition definition\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.get_item-NTuple{5,Any}","page":"Home","title":"Paraml.get_item","text":"Get and check item from the params, falling back on the definitions default.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.headtail-Tuple{Any,Vararg{Any,N} where N}","page":"Home","title":"Paraml.headtail","text":"Get the head and tail tuples from args\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.keys_or_vals-Tuple{AbstractDict}","page":"Home","title":"Paraml.keys_or_vals","text":"Get the keys of a dict, or the items in a list.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.merge_rec-Tuple{AbstractDict,AbstractDict}","page":"Home","title":"Paraml.merge_rec","text":"Recursively merge two nested dictionaries\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.parse_classes-Tuple{AbstractDict,AbstractDict}","page":"Home","title":"Paraml.parse_classes","text":"Parse the classes definition first as it is needed in parsing the full params.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.parse_params-Tuple{AbstractDict,AbstractDict}","page":"Home","title":"Paraml.parse_params","text":"Recursively parse the passed params, using the definitions to validate and provide defaults.\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.parse_subdict-NTuple{5,Any}","page":"Home","title":"Paraml.parse_subdict","text":"Parse a type == sub-dict definition\n\n\n\n\n\n","category":"method"},{"location":"#Paraml.warn_unused_params-Tuple{AbstractDict,AbstractDict}","page":"Home","title":"Paraml.warn_unused_params","text":"Compare the original params to what was parsed and print warnings for any original params that are unused in the final parsed parasms.\n\n\n\n\n\n","category":"method"}]
}
