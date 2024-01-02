// import AMapLoader from '@amap/amap-jsapi-loader';
export class ThreeAmap{
  constructor(node,bounds){
    this.node = node
    const bound = []
    bounds.features.forEach(polygon => {
      // console.log(polygon)
      polygon.geometry.coordinates.forEach(item => {
        for (let i = 0; i < item.length; i++) {
          const element = item[i];
          bound.push(0)
          bound.push(1)
        }
      })
    });
  }
  init(){
    // this.map = new AMapLoader(this.node,{

    // })
  }
}