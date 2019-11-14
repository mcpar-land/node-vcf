/// <reference types="node" />

declare class vCard {
  constructor();

  /** Version number */
  version: CardVersion;

  /** Card data */
  data: {[field: string]: vCard.Property};

  /** Add a vCard property  */
  add(key: PropertyType, value: string, params?: jCardParameters): vCard;

  /**
   * Add a vCard property from an already
   * constructed vCard.Property
   */
  addProperty(prop: vCard.Property): vCard;

  /**
   * Get a vCard property
   * optionally, only get properties with the given `type`.
   */
  get(key: PropertyType, type?: string ): vCard.Property | vCard.Property[];

  /** Parse a string or buffer into a vCard object*/
  parse(value: string|Buffer): vCard;

  /** Set a vCard property */
  set(key: PropertyType, value: string, params?: jCardParameters): vCard;

  /**
   * Set a vCard property from an already
   * constructed vCard.Property
   */
  setProperty(prop: vCard.Property): vCard;

  /** Returns a formatted jCard JSON object */
  toJCard(version?: CardVersion): jCard;

  /** Returns a formatted jCard JSON object */
  toJSON(): jCard;

  /** Format the vCard as vcf with given version */
  toString(version?: CardVersion, charset?: string): string;

  /** Is equal to `\r\n` */
  static EOL: '\r\n';

  /** is equal to `.vcf` */
  static extension: '.vcf';

  /**
   * Folds a long line according to the RFC 5322.
   * @see http://tools.ietf.org/html/rfc5322#section-2.1.1
   */
  private static foldLine(
    input: string,
    maxLength?: number,
    hardWrap?: boolean
  ): string;

  /** Format a card object according to the given version */
  static format(card: vCard, version?: CardVersion): string;

  /** Constructs a vCard from jCard data */
  static fromJSON(jcard: jCard): vCard;

  /** Check whether a given version is supported */
  static isSupported(version: CardVersion): boolean;

  /** vCard mime type */
  static mimeType: 'text/vcard';

  /** Normalizes input (cast to string, line folding, whitespace) */
  static normalize(input: string): string;

  /**
   * Returns an array of vCard objects from a multiple-card string.
   * (For a single vCard object, use `new vCard().parse(...)` instead)
   */
  static parse(value: string|Buffer): vCard[];

  /**
   * Parse an array of vcf formatted lines
   * @internal used by `vCard#parse()`
   */
  static parseLines(lines: ReadonlyArray<string>): any;

  /** vCard versions */
  static versions: CardVersion[];
}

declare namespace vCard {
  class Property {
      constructor(field: PropertyType, value: string, params?: jCardParameters);

      /** Returns a deep-copied clone of the property */
      clone(): Property;

      /** Check if the property is of a given type */
      is(type: string): boolean;

      /** Check whether the property is empty */
      isEmpty(): boolean;

      /** Format the property as jCard data */
      toJSON(): jCardProperty;

      /** Format the property as vcf with given version */
      toString(version?: CardVersion): string;

      /** Get the property's value */
      valueOf(): string;

      /** Get the property's field */
      fieldOf(): string;

      /** Set the value of the property. */
      setValue(value: string): string;

      /** Constructs a vCard.Property from jCard data */
      static fromJSON(data: jCardProperty): Property;
  }
}

type CardVersion = '2.1' | '3.0' | '4.8';

type jCardProperty = [ string, string, string, string | string[] ];

/** jCard standard format */
type jCard = [ 'vcard', jCardProperty[] ];
