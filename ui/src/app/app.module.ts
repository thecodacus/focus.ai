import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { ResultsBoxComponent } from './results-box/results-box.component';
import { PreviewBoxComponent } from './preview-box/preview-box.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchBoxComponent,
    ResultsBoxComponent,
    PreviewBoxComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, NgxElectronModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
