import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaces'
})
export class AddSpacesPipe implements PipeTransform {

  transform(value: string): string {
    return value && value.replace(new RegExp("_", 'g'), " ");
  }

}
