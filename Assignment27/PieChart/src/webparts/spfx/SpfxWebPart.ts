
import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneDropdown,
  IWebPartContext
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './SpfxWebPart.module.scss';
import * as strings from 'PieChartStrings';
import * as strings2 from 'SpfxWebPartStrings';


import { IPieChartWebPartProps } from './IPieChartWebPartProps';

var Chart: any = require('chartjs');

import { PropertyFieldCustomList, CustomListFieldType } from 'sp-client-custom-fields/lib/PropertyFieldCustomList';
import { PropertyFieldColorPickerMini } from 'sp-client-custom-fields/lib/PropertyFieldColorPickerMini';
import { PropertyFieldFontPicker } from 'sp-client-custom-fields/lib/PropertyFieldFontPicker';
import { PropertyFieldFontSizePicker } from 'sp-client-custom-fields/lib/PropertyFieldFontSizePicker';
import { PropertyFieldDimensionPicker } from 'sp-client-custom-fields/lib/PropertyFieldDimensionPicker';

import * as $ from 'jquery';

var URLPath : string;
import { SPComponentLoader } from '@microsoft/sp-loader';
require('bootstrap');
//require('myscript');
//require('myscript2');
require('myscript3');

export interface ISpfxWebPartProps {
  description: string;
}






export default class SpfxWebPart extends BaseClientSideWebPart<IPieChartWebPartProps> {


  private guid: string;

  /**
   * @function
   * Web part contructor.
   */
  public constructor(context?: IWebPartContext) {
    super();

    this.guid = this.getGuid();

    //Hack: to invoke correctly the onPropertyChange function outside this class
    //we need to bind this object on it first
    this.onPropertyPaneFieldChanged = this.onPropertyPaneFieldChanged.bind(this);
  }

  /**
   * @function
   * Gets WP data version
   */
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private getDataTab(property: string): string[] {
    var res: string[] = [];
    this.properties.items.map((item: any) => {
      res.push(item[property]);
    });
    return  res;
  }

  /**
   * @function
   * Renders HTML code
   */
  public render(): void {

     let url = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    
      SPComponentLoader.loadCss(url);

    var html = '<canvas id="' + this.guid + '" width="' + this.properties.dimension.width + '" height="' + this.properties.dimension.height + '"></canvas>';
    this.domElement.innerHTML = html;

        var data = {
        labels: this.getDataTab("Label"),
        datasets: [
            {
                data: this.getDataTab("Value"),
                backgroundColor: this.getDataTab("Color"),
                hoverBackgroundColor: this.getDataTab("Hover Color")
            }
        ]
      };
      var options = {
        responsive: this.properties.responsive != null ? this.properties.responsive : false,
        cutoutPercentage: this.properties.cutoutPercentage != null ? this.properties.cutoutPercentage : 0,
        animation: {
            animateRotate: this.properties.animateRotate,
            animateScale: this.properties.animateScale
        },
        title: {
            display: this.properties.titleEnable,
            text: this.properties.title,
            position: this.properties.position,
            fontFamily: this.properties.titleFont != null ? this.properties.titleFont : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            fontSize: this.properties.titleSize != null ? Number(this.properties.titleSize.replace("px", "")) : 12,
            fontColor: this.properties.titleColor != null ? this.properties.titleColor : "#666"
        },
        legend: {
            display: this.properties.legendEnable,
            position: this.properties.legendPosition != null ? this.properties.legendPosition : 'top',
            labels: {
                fontColor: this.properties.legendColor != null ? this.properties.legendColor : "#666",
                fontFamily: this.properties.legendFont != null ? this.properties.legendFont : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                fontSize: this.properties.legendSize != null ? Number(this.properties.legendSize.replace("px", "")) : 12
            }
        }
      };
      var ctx = document.getElementById(this.guid);
      new Chart(ctx, {
          type: 'pie',
          data: data,
          options: options
      });

  }

  /**
   * @function
   * Generates a GUID
   */
  private getGuid(): string {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }

  /**
   * @function
   * Generates a GUID part
   */
  private s4(): string {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }

  /**
   * @function
   * PropertyPanel settings definition
   */
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldCustomList('items', {
                  label: strings.Items,
                  value: this.properties.items,
                  headerText: strings.ManageItems,
                  fields: [
                    { id: 'Label', title: "Label", required: true, type: CustomListFieldType.string },
                    { id: 'Value', title: "Value", required: true, type: CustomListFieldType.number },
                    { id: 'Color', title: "Color", required: true, type: CustomListFieldType.color },
                    { id: 'Hover Color', title: "Hover Color", required: true, type: CustomListFieldType.color }
                  ],
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  context: this.context,
                  properties: this.properties,
                  key: 'pieChartListField'
                }),
                PropertyPaneToggle('responsive', {
                  label: strings.Responsive,
                }),
                PropertyFieldDimensionPicker('dimension', {
                  label: strings.Dimension,
                  initialValue: this.properties.dimension,
                  preserveRatio: true,
                  preserveRatioEnabled: true,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  disabled: false,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'pieChartDimensionFieldId'
                })
              ]
            },
            {
              groupName: strings.OptionsGroupName,
              groupFields: [
                PropertyPaneSlider('cutoutPercentage', {
                  label: strings.CutoutPercentage,
                  min: 0,
                  max: 99,
                  step: 1
                }),
                PropertyPaneToggle('animateRotate', {
                  label: strings.AnimateRotate
                }),
                PropertyPaneToggle('animateScale', {
                  label: strings.AnimateScale
                })
              ]
            },
            {
              groupName: strings.TitleGroupName,
              groupFields: [
                PropertyPaneToggle('titleEnable', {
                  label: strings.TitleEnable
                }),
                PropertyPaneTextField('title', {
                  label: strings.Title
                }),
                PropertyPaneDropdown('position', {
                  label: strings.Position,
                  options: [
                    {key: 'top', text: 'top'},
                    {key: 'left', text: 'left'},
                    {key: 'bottom', text: 'bottom'},
                    {key: 'right', text: 'right'}
                  ]
                }),
                PropertyFieldFontPicker('titleFont', {
                  label: strings.TitleFont,
                  useSafeFont: true,
                  previewFonts: true,
                  initialValue: this.properties.titleFont,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartTitleFontField'
                }),
                PropertyFieldFontSizePicker('titleSize', {
                  label: strings.TitleSize,
                  usePixels: true,
                  preview: true,
                  initialValue: this.properties.titleSize,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartTitleSizeField'
                }),
                PropertyFieldColorPickerMini('titleColor', {
                  label: strings.TitleColor,
                  initialColor: this.properties.titleColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartTitleColorField'
                })
              ]
            },
            {
              groupName: strings.LegendGroupName,
              groupFields: [
                PropertyPaneToggle('legendEnable', {
                  label: strings.LegendEnable
                }),
                PropertyPaneDropdown('legendPosition', {
                  label: strings.LegendPosition,
                  options: [
                    {key: 'top', text: 'top'},
                    {key: 'left', text: 'left'},
                    {key: 'bottom', text: 'bottom'},
                    {key: 'right', text: 'right'}
                  ]
                }),
                PropertyFieldFontPicker('legendFont', {
                  label: strings.LegendFont,
                  useSafeFont: true,
                  previewFonts: true,
                  initialValue: this.properties.legendFont,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartLegendFontField'
                }),
                PropertyFieldFontSizePicker('legendSize', {
                  label: strings.LegendSize,
                  usePixels: true,
                  preview: true,
                  initialValue: this.properties.legendSize,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartLegendSizeField'
                }),
                PropertyFieldColorPickerMini('legendColor', {
                  label: strings.LegendColor,
                  initialColor: this.properties.legendColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  key: 'pieChartLegendColorField'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}





//   public getListsInfo() 
// {
//   URLPath = this.context.pageContext.web.absoluteUrl;
  
 
//   let html: string = '';
//   if (Environment.type === EnvironmentType.Local) {
//     this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
//   } else {


//     var call = $.ajax({
//       url:this.context.pageContext.web.absoluteUrl+ `/_api/web/lists/GetByTitle('Managers Speaks')/Items?$select = 'ID,Subject,ImageUrl,Description&$top=5&$orderby=Modified desc'`, 
//       type: 'GET',
//       dataType: "json",
//       headers: {
//           Accept: "application/json;odata=verbose"
//       }
//   });

//   call.done(function (data, textStatus, jqXHR) {

//   $.each(data.d.results, function (i, item) {
//       $('   <div class="item">    <img src="'+item.ImageUrl+'" style="width:50%;" >'+

//       '<div class="carousel-caption">       <h3>'+item.Subject+'</h3>   '+

//       '<button type="button"class="btn btn-info btn-lg" data-toggle="modal"data-target="#myModal"'+
//       ' data-id="'+item.ID+'" >'+item.Subject+'</button></div></div>'   +
//       '    ').appendTo('.carousel-inner');
 
//     });
//     $('.item').first().addClass('active');
//     $('.carousel-indicators > li').first().addClass('active');
//     $('#carousel-example-generic').carousel();

// });

// call.fail(function (jqXHR, textStatus, errorThrown) {
//     var response = JSON.parse(jqXHR.responseText);
//     var message = response ? response.error.message.value : textStatus;
//     alert("Call failed. Error: " + message);
// });

      
//   }
// }

 

//   protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
//     return {
//       pages: [
//         {
//           header: {
//             description: strings.PropertyPaneDescription
//           },
//           groups: [
//             {
//               groupName: strings.BasicGroupName,
//               groupFields: [
//                 PropertyPaneTextField('description', {
//                   label: strings.DescriptionFieldLabel
//                 })
//               ]
//             }
//           ]
//         }
//       ]
//     };
//   }
















// this.domElement.innerHTML = `

// <div class="${ styles.spfx }">
// <div class="${ styles.container }">
//   <div class="${ styles.row}"style ="background-color:${escape(this.properties.description)};">
//     <div class="${ styles.column }">
//       <span class="${ styles.title }">Welcome to SharePoint!</span>
//       <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
//       <p class="${ styles.description }">${escape(this.properties.description)}</p>
         
      
//       <div class="container">
 
      
//    <div>
//    <button type="button" class="btn btn-primary">WonderLa</button>
//    <button type="button" class="btn btn-success">Ramoji</button>
//    <button type="button" class="btn btn-info">Opera</button>
//    <button type="button" class="btn btn-warning">OceanPark</button>

//    </div>
//    <div>
//    <button type="button" class="btn btn-danger">Submit</button>
 
//     </div>

//     <div id="chartContainer" style="height: 300px; width: 100%;"></div>
//     </div>
    
//     <div id="piechart"></div>

//     <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

//     </div>
  
//   </div>
  
// </div>
// <label id="lists"></label>

// </div>

// `;







// google.charts.load('current', {'packages':['corechart']});
// google.charts.setOnLoadCallback(drawChart);

// // Draw the chart and set the chart values
// function drawChart() {
//   var data = google.visualization.arrayToDataTable([
//   ['Task', 'Hours per Day'],
//   ['Work', 8],
//   ['Eat', 2],
//   ['TV', 4],
//   ['Gym', 2],
//   ['Sleep', 8]
// ]);

//   // Optional; add a title and set the width and height of the chart
//   var options = {'title':'My Average Day', 'width':550, 'height':400};

//   // Display the chart inside the <div> element with id="piechart"
//   var chart = new google.visualization.PieChart(document.getElementById('piechart'));
//   chart.draw(data, options);
// }






// alert('eneterd ready');
// var options = {
//   exportEnabled: true,
//   animationEnabled: true,
//   title:{
//     text: "Accounting"
//   },
//   legend:{
//     horizontalAlign: "right",
//     verticalAlign: "center"
//   },
//   data: [{
//     type: "pie",
//     showInLegend: true,
//     toolTipContent: "<b>{name}</b>: ${y} (#percent%)",
//     indexLabel: "{name}",
//     legendText: "{name} (#percent%)",
//     indexLabelPlacement: "inside",
//     dataPoints: [
//       { y: 6566.4, name: "Housing" },
//       { y: 2599.2, name: "Food" },
//       { y: 1231.2, name: "Fun" },
//       { y: 1368, name: "Clothes" },
//       { y: 684, name: "Others"},
//       { y: 1231.2, name: "Utilities" }
//     ]
//   }]
// };
// $("#chartContainer").CanvasJSChart(options);