$('#locationlist a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
  list()
  console.log(this)
})


var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var scaleColor=d3.scaleOrdinal()
	.domain(['China','Taiwan','Hongkong'])
	.range(['red','blue','green']),
	scaleX=d3.scaleLinear()
	.domain([1995,2016])
	.range([0,w]),
	scaleY=d3.scaleLinear()
	.domain([0,500])
	.range([h,0]);
var lineGenerator = d3.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleY(d.rank)});
var axisX = d3.axisBottom()
    .scale(scaleX)
    .tickSize(-h);
var axisY = d3.axisLeft()
    .scale(scaleY)
    .tickSize(-w);
var Byname;


d3.csv('../data/fortunedata_01052017.csv',parse,dataloaded);

function dataloaded(err, fortune){
	// console.table(fortune);
Byname=d3.nest()
    .key(function(d){return d.name}).sortKeys(d3.ascending)
    .entries(fortune)
    drawline(Byname);

list();

plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+h+')')
    .call(axisX);
plot.append('g').attr('class','axis axis-y')
    .call(axisY);

}
function list(){
var list=Byname.filter(function(d){
    var tab=d3.select('#locationlist').select('.active')._groups[0][0].id;
    console.log(tab);
    return d.values[0].location==tab});
console.log(list)
var update=d3.select('#list').selectAll('.item')
        .data(list,function(d){return d.key});
    update.enter()
        .append('a').attr('class','item list-group-item')
        .attr('href','#')
        .html(function(d){return d.key})
        .on('click',function(d){
            d3.selectAll('.item').classed('active',false);
            d3.select(this).classed('active',true);
            d3.selectAll('.country').remove(); 
            d3.selectAll('.allnode').remove();           
            var item=[];
            item.push(d);
            // console.log(item)
            drawline(item);
        });
    update.exit().remove();
}
function drawline(data){

	// console.table(data)
var line=plot.append('g').selectAll('.country')
		.data(data,function(d){return d.key}),
    node=plot.append('g').selectAll('.allnode')
        .data(data,function(d){return d.key})
        .enter().append('g').attr('class','allnode');
    node.selectAll('.node')
        .data(function(d){return d.values})
        .enter()
        .append('circle').attr('class','.node')
        .attr('r',1.2)
        .attr('cx',function(d){return scaleX(d.year)})
        .attr('cy',function(d){return scaleY(d.rank)})
        .style('fill',function(d){return d.location?scaleColor(d.location):'grey'})

	line.enter()
        .append('path').attr('class','country')
        .datum(function(d){return d.values})
        .attr('d',function(d){return lineGenerator(d);})
        .style('stroke',function(d){return d[0].location?scaleColor(d[0].location):'grey'})
        .style('stroke-width',function(d){return d[0].location?'1px':'.5px'})
        .style('fill','none')
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.select('.title')
                .html(d[0].name)
            tooltip.select('.value')
                .html(d[0].location);

            tooltip.transition().style('opacity',1);

            d3.select(this).style('stroke-width','2px');           
        })
        .on('mousemove',function(d){
            var tooltip = d3.select('.custom-tooltip');
            var xy = d3.mouse( d3.select('.container-fluid').node() );
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');
        })
        .on('mouseleave',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition().style('opacity',0);

            d3.select(this).style('stroke-width','1.5px');
        })
        .on('click',function(d){console.log(d)});
    node.exit().remove(); 
    line.exit().remove();   
}
function parse(d){
if(d['Location']==""||d['Location']==undefined)return;
    return {
    	year:+d['Year'],
        rank:+d['Rank'],
        name:d['Name'],
        location:d['Location'],        
    }
}
