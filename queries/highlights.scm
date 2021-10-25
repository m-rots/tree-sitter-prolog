; (dict_pair
;     key: (atom) @property)

(fact
    ; Only give the function markup when parameters are given.
    name: (atom) @function
    parameters: (parameters))

(fact
    "." @operator)

(rule
    name: (atom) @function
    ":-" @operator
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

"," @punctuation.delimiter
"." @punctuation.delimiter

(negated_expression
    "\\+" @operator)

[
    "is"
] @operator

(binary_expression [
    "="
] @operator)