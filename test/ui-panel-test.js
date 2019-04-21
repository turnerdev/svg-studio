import { expect } from 'chai'; 
import { UIPanel } from '../src/ui-panel.js';

describe('<ui-panel> unit tests', () => {
  let container;
  
  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should render title', () => {
    const title = 'Test Title'
    const host = {
      title: title,
      icon: 'layer'
    };
    const update = UIPanel.render(host);

    update(host, container);
    
    expect(container.querySelector('.header').textContent.trim()).equal(title);
  });

  it('should render collapsed', () => {
    const host = { collapsed: true };
    const update = UIPanel.render(host);

    update(host, container);
    
    expect(container.querySelector('.body')).equal(null);
  });
});