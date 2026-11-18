import {Component} from 'react';

export default class PreviewErrorBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return{failed:true}}
 componentDidCatch(error){console.error('Pratinjau undangan gagal:',error)}
 componentDidUpdate(previous){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false})}
 render(){return this.state.failed?<div role="alert" style={{padding:28,background:'#f5f2e8',color:'#526745',font:'13px/1.8 Manrope,sans-serif',height:'100%',display:'grid',placeContent:'center',textAlign:'center'}}><h3>Pratinjau belum bisa ditampilkan</h3><p>Editor tetap bisa digunakan. Pilih tema lain atau coba muat ulang pratinjau.</p><button type="button" onClick={()=>this.setState({failed:false})}>Coba lagi</button></div>:this.props.children}
}
