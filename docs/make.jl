using Paraml
using Documenter

makedocs(;
    modules = [Paraml],
    authors = "mcmcgrath13 <m.c.mcgrath13@gmail.com> and contributors",
    repo = "https://github.com/pph-collective/Paraml.jl/blob/{commit}{path}#L{line}",
    sitename = "Paraml.jl",
    format = Documenter.HTML(;
        prettyurls = get(ENV, "CI", "false") == "true",
        canonical = "https://pph-collective.github.io/Paraml.jl",
        assets = String[],
    ),
    pages = ["Home" => "index.md"],
)

deploydocs(; repo = "github.com/pph-collective/Paraml.jl")
