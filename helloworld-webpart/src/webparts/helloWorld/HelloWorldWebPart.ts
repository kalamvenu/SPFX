import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorldWebPart.module.scss';

import * as strings from 'HelloWorldWebPartStrings';

import  Prop from './loc/Property';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';


export default class HelloWorldWebPart extends BaseClientSideWebPart<Prop> {

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${ styles.helloWorld }">
        <div class="${ styles.container }">
          <div class="${ styles.row}"style ="background-color:${escape(this.properties.color)};">
            <div class="${ styles.column }">
              <span class="${ styles.title }">Welcome to SharePoint!</span>
              <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
              <p class="${ styles.description }">${escape(this.properties.PropDescription)}</p>
               <p class="${ styles.description }">${escape(this.properties.color)}</p>               
               <a  class="${ styles.button }">
               <select name="Products" id = "DropDown" class = "DropDownClass"   >              
               </select>   
              </a>
            </div>
          </div>
        </div>
        <label id="lists"></label>
      </div>`;
     this.getListsInfo();// populate drop down list
     this.ChangeEvent();
  }


public ChangeEvent()
{
  alert("entered change event");
  this.domElement.querySelector('#DropDown').addEventListener('change',()=> this.FilteredElements())
}

  private getListsInfo() 
{
  alert("entered getlistsinfo event");
  let html: string = '';
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
  } else {
  this.context.spHttpClient.get
  (
    this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('Category')/Items?$select = 'Title'`, 
    SPHttpClient.configurations.v1)
    .then((response: SPHttpClientResponse) => {
      response.json().then((listsObjects: any) => {
        listsObjects.value.forEach(listObject => {     

         var  selected = this.domElement.querySelector('#DropDown') as HTMLSelectElement ;
         
         selected.options[selected.options.length] = new Option(listObject.Title, listObject.Title);  

      //   this.FilteredElements(selected);    
        });       
      });
    });        
  }
}

//lists/GetByTitle('Products')/Items?$select = 'Title,Category'&$filter = Product/Category eq 'Beverages'`, 
//GetByTitle('Products')/Items?$select = Title,Category/Title&$expand = Category/Title`


private FilteredElements() 
{
  
  let selected = (<HTMLSelectElement>this.domElement.querySelector('#DropDown')).value;
  alert(selected);
  let html: string = '';
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
  } else {
  this.context.spHttpClient.get
  (
    this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('Products')/Items?$select = Title&$filter=(Category/Title eq '${selected}')`, 
    SPHttpClient.configurations.v1)
    .then((response: SPHttpClientResponse) => {
      response.json().then((listsObjects: any) => {
        listsObjects.value.forEach(listObject => {
          html += `
                  <ul>
                      <li>
                          <span class="ms-font-l">${listObject.Title}</span>
                  
                      </li>
                  </ul>`;
        });
        this.domElement.querySelector('#lists').innerHTML = html;
       
      });
    });        
  }
}

//<span class="ms-font-l">${listObject.CategoryId}</span>
///_api/web/lists/getByTitle('Employee')/items?$select=Title,Company/ID,Company/Title&$expand=Company/ID
//<span class="${ styles.label }">Learn more</span>  


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
                }),
                PropertyPaneDropdown('color',{
                  label:'select item',
                  options:[
                  {key:"red",text: "red"},
                 {key:"green",text: "green"},
                 {key:"blue",text: "blue"}]})
              ]
            }
          ]
        }
      ]
    };
  }
}

