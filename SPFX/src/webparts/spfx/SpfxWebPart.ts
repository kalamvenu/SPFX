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
        
          <div class="${ styles.row }">
            <div class="${ styles.column }">
              <span class="${ styles.title }"></span>
              <p class="${ styles.subTitle }"></p>
           
              <div class="container">


              <!-- pop up -->

              <div class="modal fade" id="myModal" role="dialog">
              <div class="modal-dialog modal-sm">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                  
                  </div>
                  <div class="modal-body">
                  <img src="https://www.elastic.co/assets/blt3541c4519daa9d09/maxresdefault.jpg?uid=blt3541c4519daa9d09" class="showPic" height="200" width="280">
                  <label  class="control-label"></label>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- slides for slides -->
              <div id="myCarousel" class="carousel slide" data-ride="carousel">
                <!-- Indicators -->
                <ol class="carousel-indicators">
                  <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
                  <li data-target="#myCarousel" data-slide-to="1"></li>
                  <li data-target="#myCarousel" data-slide-to="2"></li>
                </ol>
            
                <!-- Wrapper for slides -->
                <div class="carousel-inner">
                 
                </div>
            
                <!-- buttons for slides -->
                <div class="carousel-buttons">
               
                </div>

                <!-- Left and right controls -->
                <a class="left carousel-control" href="#myCarousel" data-slide="prev">
                  <span class="glyphicon glyphicon-chevron-left"></span>
                  <span class="sr-only">Previous</span>
                </a>
                <a class="right carousel-control" href="#myCarousel" data-slide="next">
                  <span class="glyphicon glyphicon-chevron-right"></span>
                  <span class="sr-only">Next</span>
                </a>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>`;

      this.getListsInfo();
      $(document).ready(function(){
        
  
        $('#myModal').on('show.bs.modal', function (event) {
          var button = $(event.relatedTarget) 
          var recipient = button.data('whatever') 
          var recipient1 = button.data('ever')
          var recipient2 = button.data('eve')
          var modal = $(this)
          
          modal.find('.modal-header').css('background', 'red');
          modal.find('.modal-header').text( recipient)
          modal.find('.modal-body').css('background', 'green');
          modal.find('.control-label').text(recipient2)
          modal.find('.modal-footer').css('background', 'yellow');
          modal.find('.showPic').attr("src", recipient1);
          
        })

      });
      
  }

  public getListsInfo() 
{
  alert("entered getlistsinfo event");
  let html: string = '';
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
  } else {


    var call = $.ajax({
      url:this.context.pageContext.web.absoluteUrl+ `/_api/web/lists/GetByTitle('Managers Speaks')/Items?$select = 'Subject,ImageUrl,Description&$orderby=Created desc'`, 
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
      ' data-whatever="'+item.Subject+'" data-ever="'+item.ImageUrl+'" data-eve="'+item.Description+'">'+item.Subject+'</button></div></div>'   +
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
