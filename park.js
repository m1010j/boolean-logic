
  // supposeIs(boolean, partialModel = {}) {
  //   if (this.children.length === 0) {
  //     if (this.value === 't' && boolean === true) {
  //       return { t: boolean };
  //     } else if (this.value === 'f' && boolean === false) {
  //       return { f: boolean };
  //     } else if (this.value === 't' && boolean === false) {
  //       return;
  //     } else if (this.value === 'f' && boolean === true) {
  //       return;
  //     } else {
  //       if (partialModel[this.value] === boolean) {
  //         return partialModel;
  //       } else if (partialModel[this.value] === !boolean) {
  //         return;
  //       } else {
  //         return Object.assign({}, partialModel, {
  //           [this.value]: boolean,
  //         });
  //       }
  //     }
  //   } else if (this.value === "N") {
  //     return this.children[0].supposeIs(!boolean, partialModel);
  //   // } else if (this.children.length === 2) {
      
  //   }
  // }