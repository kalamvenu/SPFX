import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './SpfxWebPart.module.scss';
import * as strings from 'SpfxWebPartStrings';
import * as $ from 'jquery';

var URLPath : string;
import { SPComponentLoader } from '@microsoft/sp-loader';
require('bootstrap');
export interface ISpfxWebPartProps {
  description: string;
}

export default class SpfxWebPart extends BaseClientSideWebPart<ISpfxWebPartProps> {

  public render(): void {
     let url = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";

     SPComponentLoader.loadCss(url);
  
this.domElement.innerHTML = `

<div class="${ styles.spfx }">
<div class="${ styles.container }">
  <div class="${ styles.row}"style ="background-color:${escape(this.properties.description)};">
    <div class="${ styles.column }">
      <span class="${ styles.title }">Welcome to SharePoint!</span>
      <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
      <p class="${ styles.description }">${escape(this.properties.description)}</p>
         
      
      <div class="container">
 
      
   <div>
   <button type="button" class="btn btn-primary" id = "Delhi">Delhi</button>
   <button type="button" class="btn btn-success" id = "Mumbai">Mumbai</button>
   <button type="button" class="btn btn-info" id = "Kolkata">Kolkata</button>
   <button type="button" class="btn btn-warning" id = "Hyderabad">Hyderabad</button>

   </div>
   <div>
   <button type="button" class="btn btn-danger" id = "Submit">Submit</button>
 
    </div>

    <div id="chartContainer" style="height: 300px; width: 100%;"></div>
    </div>
    
    <div id="piechart"></div>

    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

    </div>
  
  </div>
  
</div>
<label id="lists"></label>

</div>

`;


    
      $(document).ready(function(){
        
        $("#Submit").click(function(){
          alert("The paragraph was clicked.");
          $('#Submit').removeClass('active').addClass('inactive');
          $(this).removeClass('inactive').addClass('active');
          
          var call =  $.ajax({
            url: this.context.pageContext.web.absoluteUrl+ `/_api/web/lists/GetByTitle('Managers Speaks')/Items?$select = 'ID,Subject,ImageUrl,Description&$top=5&$orderby=Modified desc'`, 
            type: "POST",
            data:  JSON.stringify({ '__metadata': { 'type': 'SP.List' }, 'AllowContentTypes': true,
     'BaseTemplate': 100, 'ContentTypesEnabled': true, 'Description': 'My list description', 'Title': 'Test' }
    ),
            headers: { 
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "content-length": <length of post body>,
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: doSuccess,
            error: doError
    });
  



      });


      });
      
  }

  public getListsInfo() 
{
  URLPath = this.context.pageContext.web.absoluteUrl;
  
 
  let html: string = '';
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
  } else {


    var call = $.ajax({
      url:this.context.pageContext.web.absoluteUrl+ `/_api/web/lists/GetByTitle('Managers Speaks')/Items?$select = 'ID,Subject,ImageUrl,Description&$top=5&$orderby=Modified desc'`, 
      type: 'GET',
      dataType: "json",
      headers: {
          Accept: "application/json;odata=verbose"
      }
  });

  call.done(function (data, textStatus, jqXHR) {

  $.each(data.d.results, function (i, item) {
      $('   <div class="item">    <img src="'+item.ImageUrl+'" style="width:50%;" >'+

      '<div class="carousel-caption">       <h3>'+item.Subject+'</h3>   '+

      '<button type="button"class="btn btn-info btn-lg" data-toggle="modal"data-target="#myModal"'+
      ' data-id="'+item.ID+'" >'+item.Subject+'</button></div></div>'   +
      '    ').appendTo('.carousel-inner');
 
    });
    $('.item').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel-example-generic').carousel();

});

call.fail(function (jqXHR, textStatus, errorThrown) {
    var response = JSON.parse(jqXHR.responseText);
    var message = response ? response.error.message.value : textStatus;
    alert("Call failed. Error: " + message);
});

      
  }
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
