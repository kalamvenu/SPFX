declare interface ISpfxWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'SpfxWebPartStrings' {
  const strings: ISpfxWebPartStrings;
  export = strings;
}
