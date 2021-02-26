using Paraml
using Test

const DEF_PATH = "params/defs.yaml"

@testset "Paraml.jl" begin

    @testset "merge params" begin
        params = create_params(
            DEF_PATH,
            "params/a.yaml",
            "params/b",
            "params/c.yaml"
        )

        @test haskey(params["classes"]["animals"], "cat")
        @test params["demographics"]["cat"]["barn"]["age_bins"][1]["age"] == 3
        @test params["demographics"]["cat"]["barn"]["age_bins"][2]["age"] == 14
        @test params["demographics"]["cat"]["barn"]["color"] == "indigo"
        @test params["demographics"]["cat"]["barn"]["num"] == 2
        @test params["demographics"]["turtle"]["ocean"]["prob_happy"] == 0.95
        @test params["neighbors"]["blue_buddies"]["distance"] == 90
    end

    @testset "throws errors" begin
        # param file has bad value, make sure key is in the logs
        @test_throws AssertionError create_params(DEF_PATH, "params/a_error.yaml")
        @test_logs "[.demographics.turtle.ocean.prob_happy]"

        # parram file has unused value, make sure error thrown
        @test_throws AssertionError create_params(
            DEF_PATH,
            "params/a_unused.yaml";
            error_on_unused = true,
        )
        @test_logs "There are unused parameters passed to the parser"
    end

    @testset "read/write" begin
        out_path = joinpath(mktempdir(), "params.yml")
        params =
            create_params(DEF_PATH, "params/a.yaml", "params/b", "params/c.yaml"; out_path)
        read_params = Paraml.build_yaml(out_path)

        @test params == read_params
    end

    @testset "check items" begin
        key_path = "item.test"

        @testset "min/max + float" begin
            defs = Dict("min" => 0, "max" => 3, "type" => "float")

            @test Paraml.check_item(1.5, defs, key_path) == 1.5
            @test Paraml.check_item(1, defs, key_path) == 1.0
            @test_throws AssertionError Paraml.check_item(-1.5, defs, key_path)
            @test_throws AssertionError Paraml.check_item(4.5, defs, key_path)
        end

        @testset "int" begin
            defs = Dict("min" => 0, "max" => 3, "type" => "int")

            @test Paraml.check_item(1, defs, key_path) == 1
            @test Paraml.check_item(1.0, defs, key_path) == 1
            @test_throws AssertionError Paraml.check_item(1.5, defs, key_path)
        end

        @testset "boolean" begin
            defs = Dict("type" => "boolean")

            @test Paraml.check_item(false, defs, key_path) == false
            @test Paraml.check_item(1, defs, key_path) == true
            @test_throws AssertionError Paraml.check_item(2, defs, key_path)
        end

        @testset "values enum" begin
            defs = Dict("type" => "enum", "values" => ["a", "b"])

            @test Paraml.check_item("a", defs, key_path) == "a"
            @test_throws AssertionError Paraml.check_item("c", defs, key_path)
        end

        @testset "class enum" begin
            defs = Dict("type" => "enum", "class" => "my_class")
            nested_classes =
                Dict("my_class" => Dict("A" => Dict("val" => 1), "B" => Dict("val" => 2)))
            flat_classes = Dict("my_class" => ["A", "B"])

            @test Paraml.check_item("A", defs, key_path; classes = nested_classes) == "A"
            @test Paraml.check_item("A", defs, key_path; classes = flat_classes) == "A"
            @test_throws AssertionError Paraml.check_item(
                "C",
                defs,
                key_path;
                classes = nested_classes,
            )
            @test_throws AssertionError Paraml.check_item(
                "C",
                defs,
                key_path;
                classes = flat_classes,
            )
        end

        @testset "values array" begin
            defs = Dict("type" => "array", "values" => ["a", "b"])

            @test Paraml.check_item(["a", "b"], defs, key_path) == ["a", "b"]
            @test Paraml.check_item([], defs, key_path) == []
            @test Paraml.check_item(["b"], defs, key_path) == ["b"]

            @test_throws AssertionError Paraml.check_item(["c"], defs, key_path)
            @test_throws AssertionError Paraml.check_item(["a", "c"], defs, key_path)
        end

        @testset "class array" begin
            defs = Dict("type" => "array", "class" => "my_class")
            nested_classes =
                Dict("my_class" => Dict("A" => Dict("val" => 1), "B" => Dict("val" => 2)))
            flat_classes = Dict("my_class" => ["A", "B"])

            @test Paraml.check_item(["A"], defs, key_path; classes = nested_classes) ==
                  ["A"]
            @test Paraml.check_item(["A"], defs, key_path; classes = flat_classes) == ["A"]
            @test_throws AssertionError Paraml.check_item(
                ["C"],
                defs,
                key_path;
                classes = nested_classes,
            )
            @test_throws AssertionError Paraml.check_item(
                ["C"],
                defs,
                key_path;
                classes = flat_classes,
            )
        end

        @testset "keys" begin
            defs = Dict("type" => "keys")
            keys = ["a", "b"]

            @test Paraml.check_item(["a", "b"], defs, key_path; keys) == ["a", "b"]
            @test Paraml.check_item([], defs, key_path; keys) == []
            @test Paraml.check_item(["b"], defs, key_path; keys) == ["b"]

            @test_throws AssertionError Paraml.check_item(["c"], defs, key_path; keys)
            @test_throws AssertionError Paraml.check_item(["a", "c"], defs, key_path; keys)
        end
    end
end
