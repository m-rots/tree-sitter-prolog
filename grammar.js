module.exports = grammar({
    name: 'prolog',

    conflicts: $ => [
        [$._expression, $._identifier]
    ],

    extras: $ => [
        /\s/,
        $.block_comment,
        $.line_comment,
    ],

    rules: {
        source_file: $ => repeat(choice(
            $._definition,
            $.query,
        )),

        _definition: $ => choice(
            $.fact_definition,
            $.rule,
        ),

        // Top-level facts must have atoms as identifier.
        fact_definition: $ => seq(
            field("name", $.atom),
            optional(field("parameters", $.parameters)),
            "."
        ),

        query: $ => seq(
            "?-",
            $._definition,
            $._expression,
            "."
        ),

        // Non-top-level facts can have variables as identifier too.
        fact: $ => seq(
            field("name", $._identifier),
            optional(field("parameters", $.parameters)),
        ),

        rule: $ => seq(
            field("name", $.atom),
            optional(field("parameters", $.parameters)),
            ":-",
            field("body", $.block),
            "."
        ),

        block: $ => sepBy1(",", $._expression),

        parameters: $ => seq(
            "(",
            sepBy1(",", $._expression), // used to be _parameter
            ")"
        ),

        list: $ => seq(
            "[",
            sepBy0(",", $._expression),
            "]"
        ),

        dictionary: $ => seq(
            field("tag", $._identifier),
            "{",
            sepBy1(",", $.dict_pair),
            "}"
        ),

        dict_pair: $ => seq(
            field("key", $.atom),
            ":",
            field("value", $._expression),
        ),

        _literal: $ => choice(
            $.integer_literal,
            $.string_literal,
        ),

        integer_literal: $ => token(choice(
            /[0-9][0-9_]*/
        )),

        string_literal: $ => token(seq(
            "\"",
            /[^\"]*/,
            "\"",
        )),

        // Expressions

        _expression: $ => choice(
            $.fact,
            $.variable,
            $.list,
            $.dictionary,
            $.parenthesized_expression,

            $._literal,

            $.binary_expression,
            $.negated_expression,
            $.numeric_assignment_expression,
            $.numeric_comparison_expression,
        ),

        parenthesized_expression: $ => seq(
            "(",
            sepBy1(",", $._expression),
            ")"
        ),

        // Inspired by https://github.com/tree-sitter/tree-sitter-rust/blob/cc7bdd3e6d14677e8aa77da64f6a3f57b6f8b00a/grammar.js#L946.
        binary_expression: $ => {
            function binaryExpression(precedence, operator) {
                return prec.left(precedence, seq(
                    field("left", $._expression),
                    field("operator", operator),
                    field("right", $._expression),
                ))
            }

            // https://www.swi-prolog.org/pldoc/man?predicate=op/3
            return choice(
                binaryExpression(1105, "|"),
                binaryExpression(1100, ";"),
                binaryExpression(700, choice(
                    '<', '=', "=..", "=@=", "\\=@=", "=:=", "=<", "==", "=\\=",
                    ">", ">=", "@<", "@=<", "@>", "@>=", "\\=", "\\==", "as", ">:<", ":<"
                )),
                binaryExpression(500, choice('+', '-', "/\\", "\\/", "xor")),
                // "//" is integer division, "/" is normal division.
                binaryExpression(400, choice('*', '/', "//", "<<", ">>", "rdiv", "rem")),
                binaryExpression(200, "^"),
                binaryExpression(200, "**"),
            )
        },

        negated_expression: $ => seq(
            "\\+",
            $._expression,
        ),

        numeric_assignment_expression: $ => seq(
            $.variable,
            "is",
            $._expression,
        ),

        numeric_comparison_expression: $ => seq(
            $.integer_literal,
            "is",
            $._expression,
        ),

        // Atoms and stuff

        _identifier: $ => choice(
            $.variable,
            $.atom,
        ),

        variable: $ => seq(
            /[A-Z]/,
            optional(/[a-zA-Z_\d]+/),
        ),

        atom: $ => choice(
            "_",
            $._lowercase_atom,
            $._quoted_atom,
        ),

        _lowercase_atom: $ => seq(
            /[a-z]/,
            optional(/[a-zA-Z_\d]+/),
        ),

        _quoted_atom: $ => seq(
            "'",
            /[_\p{XID_Start}][_\p{XID_Continue}]*/,
            "'"
        ),

        // Comments

        line_comment: $ => token(seq(
            "%", /.*/
        )),

        // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
        // Taken from tree-sitter-go
        block_comment: $ => token(seq(
            "/*",
            /[^*]*\*+([^/*][^*]*\*+)*/,
            "/"
        )),
    }
});

function sepBy1(sep, rule) {
    return seq(rule, repeat(seq(sep, rule)))
}

function sepBy0(sep, rule) {
    return optional(sepBy1(sep, rule))
}