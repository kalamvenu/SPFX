import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  IWebPartContext
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';

import { IPieChartWebPartProps } from './IPieChartWebPartProps';

import * as $ from 'jquery';


import { SPComponentLoader } from '@microsoft/sp-loader';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
require('bootstrap');

export interface IHelloWorldWebPartProps {
  description: string;
}

var Chart: any = require('chartjs');

var CurrentLoginUser:string;

var Buttonid:any;

export default class HelloWorldWebPart extends BaseClientSideWebPart<IPieChartWebPartProps> {


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


  public render(): void {

    let url="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(url);

    
var html = `
<div class="${ styles.helloWorld }">
  <div class="${ styles.container }">


    <div class="${ styles.row }">
      <div class="${ styles.column }">


        <span class="${ styles.title }">Welcome to SharePoint!</span>
        <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
        <p class="${ styles.description }">${escape(this.properties.title)}</p>
      
      
        <div class="container">
 
        <form>
          <label class="radio-inline">
            <input type="radio" name="optradio" value = "1" checked>Delhi
          </label>
          <label class="radio-inline">
            <input type="radio" name="optradio" value = "2">Mumbai
          </label>
          <label class="radio-inline">
            <input type="radio" name="optradio" value = "3">Kolkata
          </label>
          <label class="radio-inline">
          <input type="radio" name="optradio" value = "4">Hyderabad
        </label>
        </form>
      </div>

      <button id="Submit" type="button" class="btn btn-danger">Submit</button>

      </div>
    </div>
  </div>
</div>`;

    var html2 = '<canvas id="' + this.guid + '" width="' + this.properties.dimension.width + '" height="' + this.properties.dimension.height + '"></canvas>';
    
    this.domElement.innerHTML = html + html2;

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

      this.getCurrentUser();
      $(document).ready(function(){
        

        $("#Submit").click(function(){
          alert($("input[name='optradio']:checked").val());
          
          this.InsertVote();

        
      });



      });


  }



public InsertVote(){

 
    alert("SaveVote is called");
   // if(UserStatus)
    //{
        //    alert("coming is added a vote "+UserStatus);
          if (Environment.type === EnvironmentType.Local) {
            this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
          } 
          else{
            
          var Userid=CurrentLoginUser;

          Buttonid = $("input[name='optradio']:checked").val();

          alert("Location is : "+Buttonid);
          const spOpts: ISPHttpClientOptions = {
            body: `{ Vote: '${Buttonid}', Title:  '${Userid}'}`
          };
          var Url= this.context.pageContext.web.absoluteUrl+ "/_api/web/lists/getByTitle('AllVoters')/Items";
          this.context.spHttpClient.post(
            Url, SPHttpClient.configurations.v1,spOpts)
            .then((response: SPHttpClientResponse) => {
              console.log("After creation response", response);

              response.json().then((responseJSON: JSON) => {
                console.log("JSON", responseJSON);
              });

              if (response.ok) {
                alert("added");
              
              }else
              alert("fail");
              
              return;

            })
            .catch((error: SPHttpClientResponse) => {
              console.log(error);
              return;
            });
          }
    
 // }else{
 //   alert("not enter  "+ UserStatus);
 // }
  
}


public getCurrentUser()
{
  alert("Read Userid");
  var call = $.ajax(
    {
        url: this.context.pageContext.web.absoluteUrl+ `/_api/web/currentuser`,
        type: "GET",
        dataType: "json",
        headers: 
        {
            Accept: "application/json;odata=verbose"
        }
    });
    alert("after call the getCurrentUser");
    call.done(function (data, textStatus, jqXHR) {
      alert("User id successfully find");
      CurrentLoginUser=data.d.Title;
      alert(CurrentLoginUser);
  });
  call.fail(function (jqXHR, textStatus, errorThrown) {
    alert("fail in find user id");
      var response = JSON.parse(jqXHR.responseText);
      var message = response ? response.error.message.value : textStatus;
      alert("Call failed. Error: " + message);
  });
}



//   public SubmitEvent() 
// {
//   alert("entered submit event");
//   let html: string = '';
//   if (Environment.type === EnvironmentType.Local) {
//     this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
//   } else {


//     var call = $.ajax({
//       url:this.context.pageContext.web.absoluteUrl+ `/_api/web/lists/GetByTitle('Managers Speaks')/Items?$select = 'Subject,ImageUrl,Description&$orderby=Created desc'`, 
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
//       ' data-whatever="'+item.Subject+'" data-ever="'+item.ImageUrl+'" data-eve="'+item.Description+'">'+item.Subject+'</button></div></div>'   +
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




  private getDataTab(property: string): string[] {
    var res: string[] = [];
    this.properties.items.map((item: any) => {
      res.push(item[property]);
    });
    return  res;
  }


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


  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}






// this.domElement.innerHTML = `
// <div class="${ styles.helloWorld }">
//   <div class="${ styles.container }">
//     <div class="${ styles.row }">
//       <div class="${ styles.column }">
//         <span class="${ styles.title }">Welcome to SharePoint!</span>
//         <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
//         <p class="${ styles.description }">${escape(this.properties.description)}</p>
//         <a href="https://aka.ms/spfx" class="${ styles.button }">
//           <span class="${ styles.label }">Learn more</span>
//         </a>
//       </div>
//     </div>
//   </div>
// </div>`;