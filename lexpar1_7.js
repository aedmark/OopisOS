  const TokenType = {
    WORD: "WORD",
    STRING_DQ: "STRING_DQ",
    STRING_SQ: "STRING_SQ",
    OPERATOR_GT: "OPERATOR_GT",
    OPERATOR_GTGT: "OPERATOR_GTGT",
    OPERATOR_PIPE: "OPERATOR_PIPE",
    OPERATOR_BG: "OPERATOR_BG",
    EOF: "EOF",
  };
  class Token {
    constructor(type, value, position) {
      this.type = type;
      this.value = value;
      this.position = position;
    }
  }
  class Lexer {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.tokens = [];
    }
    tokenize() {
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (/\s/.test(char)) {
          this.position++;
          continue;
        }
        if (char === '"') {
          this.tokens.push(this._tokenizeString('"'));
          continue;
        }
        if (char === "'") {
          this.tokens.push(this._tokenizeString("'"));
          continue;
        }
        if (char === ">") {
          if (this.input[this.position + 1] === ">") {
            this.tokens.push(
              new Token(TokenType.OPERATOR_GTGT, ">>", this.position),
            );
            this.position += 2;
          } else {
            this.tokens.push(
              new Token(TokenType.OPERATOR_GT, ">", this.position),
            );
            this.position++;
          }
          continue;
        }
        if (char === "|") {
          this.tokens.push(
            new Token(TokenType.OPERATOR_PIPE, "|", this.position),
          );
          this.position++;
          continue;
        }
        if (char === "&") {
          this.tokens.push(
            new Token(TokenType.OPERATOR_BG, "&", this.position),
          );
          this.position++;
          continue;
        }
        let value = "";
        const startPos = this.position;
        while (
          this.position < this.input.length &&
          !/\s/.test(this.input[this.position]) &&
          !['"', "'", ">", "|", "&"].includes(this.input[this.position])
        ) {
          value += this.input[this.position];
          this.position++;
        }
        if (value) this.tokens.push(new Token(TokenType.WORD, value, startPos));
        else if (
          this.position < this.input.length &&
          !['"', "'", ">", "|", "&"].includes(this.input[this.position]) &&
          !/\s/.test(this.input[this.position])
        ) {
          throw new Error(
            `Lexer Error: Unhandled character '${this.input[this.position]}' at position ${this.position}.`,
          );
        }
      }
      this.tokens.push(new Token(TokenType.EOF, null, this.position));
      return this.tokens;
    }
    _tokenizeString(quoteChar) {
      const startPos = this.position;
      let value = "";
      this.position++;
      while (
        this.position < this.input.length &&
        this.input[this.position] !== quoteChar
      ) {
        value += this.input[this.position];
        this.position++;
      }
      if (
        this.position >= this.input.length ||
        this.input[this.position] !== quoteChar
      )
        throw new Error(
          `Lexer Error: Unclosed string literal starting at position ${startPos}. Expected closing ${quoteChar}.`,
        );
      this.position++;
      return new Token(
        quoteChar === '"' ? TokenType.STRING_DQ : TokenType.STRING_SQ,
        value,
        startPos,
      );
    }
  }
  class ParsedCommandSegment {
    constructor(command, args) {
      this.command = command;
      this.args = args;
    }
  }
  class ParsedPipeline {
    constructor() {
      this.segments = [];
      this.redirection = null;
      this.isBackground = false;
    }
  }
  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
      this.pipeline = new ParsedPipeline();
    }
    _currentToken() {
      return this.tokens[this.position];
    }
    _nextToken() {
      if (this.position < this.tokens.length - 1) this.position++;
      return this._currentToken();
    }
    _expectAndConsume(tokenType, optional = false) {
      const c = this._currentToken();
      if (c.type === tokenType) {
        this._nextToken();
        return c;
      }
      if (optional) return null;
      throw new Error(
        `Parser Error: Expected token ${tokenType} but got ${c.type} ('${c.value}') at input position ${c.position}.`,
      );
    }
    _parseSingleCommandSegment() {
      if (
        this._currentToken().type === TokenType.EOF ||
        this._currentToken().type === TokenType.OPERATOR_PIPE ||
        this._currentToken().type === TokenType.OPERATOR_BG
      )
        return null;
      const cmdToken = this._expectAndConsume(TokenType.WORD);
      if (!cmdToken)
        throw new Error("Parser Error: Expected command name (WORD).");
      const command = cmdToken.value;
      const args = [];
      while (
        this._currentToken().type !== TokenType.EOF &&
        this._currentToken().type !== TokenType.OPERATOR_PIPE &&
        this._currentToken().type !== TokenType.OPERATOR_GT &&
        this._currentToken().type !== TokenType.OPERATOR_GTGT &&
        this._currentToken().type !== TokenType.OPERATOR_BG
      ) {
        const argToken = this._currentToken();
        if (
          argToken.type === TokenType.WORD ||
          argToken.type === TokenType.STRING_DQ ||
          argToken.type === TokenType.STRING_SQ
        ) {
          args.push(argToken.value);
          this._nextToken();
        } else
          throw new Error(
            `Parser Error: Unexpected token ${argToken.type} ('${argToken.value}') in arguments at position ${argToken.position}.`,
          );
      }
      return new ParsedCommandSegment(command, args);
    }
    parse() {
      let currentSegment = this._parseSingleCommandSegment();
      if (currentSegment) this.pipeline.segments.push(currentSegment);
      else if (
        this._currentToken().type !== TokenType.EOF &&
        this._currentToken().type !== TokenType.OPERATOR_BG
      )
        throw new Error(
          `Parser Error: Expected command at start of input or after pipe.`,
        );
      while (this._currentToken().type === TokenType.OPERATOR_PIPE) {
        this._nextToken();
        currentSegment = this._parseSingleCommandSegment();
        if (!currentSegment)
          throw new Error(
            "Parser Error: Expected command after pipe operator '|'.",
          );
        this.pipeline.segments.push(currentSegment);
      }
      if (
        this._currentToken().type === TokenType.OPERATOR_GT ||
        this._currentToken().type === TokenType.OPERATOR_GTGT
      ) {
        const opToken = this._currentToken();
        this._nextToken();
        const fileToken =
          this._expectAndConsume(TokenType.WORD, true) ||
          this._expectAndConsume(TokenType.STRING_DQ, true) ||
          this._expectAndConsume(TokenType.STRING_SQ, true);
        if (!fileToken)
          throw new Error(
            `Parser Error: Expected filename after redirection operator '${opToken.value}'.`,
          );
        this.pipeline.redirection = {
          type: opToken.type === TokenType.OPERATOR_GTGT ? "append" : "overwrite",
          file: fileToken.value,
        };
      }
      if (this._currentToken().type === TokenType.OPERATOR_BG) {
        if (this.tokens[this.position + 1].type !== TokenType.EOF)
          throw new Error(
            "Parser Error: Background operator '&' must be the last character on the command line (or before EOF).",
          );
        this.pipeline.isBackground = true;
        this._nextToken();
      }
      this._expectAndConsume(TokenType.EOF);
      if (
        this.pipeline.segments.length === 0 &&
        !this.pipeline.isBackground &&
        !this.pipeline.redirection
      )
        return new ParsedPipeline(); // Return empty pipeline for empty input
      return this.pipeline;
    }
  }