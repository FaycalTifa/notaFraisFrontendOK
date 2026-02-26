import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleLabel'
})
export class RoleLabelPipe implements PipeTransform {

    transform(value: string): string {
        const labels: { [key: string]: string } = {
            'DIRECTEUR': 'Directeur',
            'CHEF_SERVICE': 'Chef de Service',
            'CHEF_SECTION': 'Chef de Section',
            'AGENT': 'Agent'
        };
        return labels[value] || value;
    }
}
