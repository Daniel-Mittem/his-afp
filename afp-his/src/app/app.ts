import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { Button } from "primeng/button";
import { Header } from "./ui/header/header";

@Component({
  selector: 'app-root',
  imports: [Button, RouterLink, RouterModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afp-his');
  
}
