export enum EnumMethodResult {
    STATUS_OKAY = '200',
    STATUS_NOT_LOGGED_IN = '403',
    STATUS_NOT_FOUND = '404',
    STATUS_SERVER_EXCEPTION = '500',

    STATUS_ABORT = 'abort',
    STATUS_LOADING = 'loading',
}

export enum EnumFieldTypes {
    ftString = 'String',
    ftAppLink = 'AppLink',
    ftDate = 'Date',
    ftDatespan = 'Datespan',
    ftYear = 'Year',
    ftBoolean = 'Boolean',
    ftInteger = 'Integer',
    ftDecimal = 'Decimal',
}

export enum EnumControltypes {
    ctCollapsible = 'Collapsible',
    ctStringInput = 'String',
    ctTextInput = 'Text',
    ctNumberInput = 'Number',
    ctSlider = 'Slider',
    ctCurrencyInput = 'Currency',
    ctHtmlInput = 'Html',
    ctDateInput = 'Date',
    ctDatespanInput = 'Datespan',
    ctTimespanInput = 'Timespan',
    ctYearInput = 'Year',
    ctInlineCombination = 'InlineCombination',
    ctSpacer = 'Spacer',
    ctOptionInput = 'Option',
    ctDivider = 'Divider',
    /**
     * @deprecated use ctAppLink instead
     */
    ctSingleModuleOption = 'SingleModuleOption',
    ctAppLink = 'AppLink',
    ctReport = 'Report',
    ctColumns = 'Columns',
    ctGoogleMap = 'GoogleMap',
    ctWidgetSimple = 'WidgetSimple',
    ctImage = 'Image',
    ctHtmlElement = 'HTMLElement',
}

export enum EnumDocumentModes {
    NEW = 'NEW',
    EDIT = 'EDIT',
    SHOW = 'SHOW',
    DASHBOARD = 'DASHBOARD'
}