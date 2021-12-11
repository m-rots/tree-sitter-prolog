; (dict_pair
;     key: (atom) @property)

(query
    "?-" @operator
    "." @operator)

(fact_definition
    ; Only give the function markup when parameters are given.
    name: (atom) @function
    parameters: (parameters)
    "." @operator)

(fact_definition
    "." @operator)

(fact
    name: ((atom) @function.builtin
        (#is-not? local))
    parameters: (parameters))

(fact
    name: (atom) @function
    parameters: (parameters))

(rule
    name: (atom) @function
    parameters: (parameters)
    "." @operator)

(atom) @constant
(variable) @type
(line_comment) @comment
(block_comment) @comment

(integer_literal) @constant.builtin
(string_literal) @string

"{" @punctuation.bracket
"}" @punctuation.bracket
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket

";" @punctuation.delimiter
"," @punctuation.delimiter
"." @punctuation.delimiter

(negated_expression
    "\\+" @operator)

[
    "is"
    ":-"
] @operator

(binary_expression [
    "="
    "|"
] @operator)