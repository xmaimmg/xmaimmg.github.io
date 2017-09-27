$(document).ready(function() {
	/*右上角购物车*/
	if($("#topcart-body").length) laodtopcart();
	/*产品详情页*/
	if($(".shop-product-intro").length){
		$('[data-plugin="touchSpin"]').TouchSpin();

		//加入购物车&立即购买
		$(document).on('click', 'a.product-tocart,a.product-buynow', function(e) {
			e.preventDefault();
			var f = true;
			$(".selectpara-body").each(function(){
				if($(this).find(".selectpara.btn-danger").length==0)f = false;
			});
			if(f){
				var paravalStr = encodeURIComponent(paraval()).replace('*','u002A'),
					url = $(this).attr('href')+'|'+paravalStr+'&num='+$("#buynum").val();
				window.location.href = url;
			}else{
				alertify.error('请选择选项');
			}
		});
		//选择选项
		$(document).on('click', '.selectpara', function(e) {
			var ps = $(this).parent().find('.selectpara');
			ps.removeClass('btn-danger');
			$(this).addClass('btn-danger');
			stock_price();
		});
		stock_price();

	}

});
/*获取选项*/
function paraval(){
	var str = '';
	$('.selectpara.btn-danger').each(function(){
		str+=$(this).data('val')+',';
	});
	str = str.substring(0,str.length-1);
	return str;
}
/*计算价格*/
function stock_price(){
	var str = paraval();
	$.each(stockjson, function(i, item){
		if(item.valuelist==str){
			$("#price").html(item.price_str);
			$('#stock-num').html(item.stock);
			$('[data-plugin="touchSpin"]').trigger("touchspin.updatesettings", {max: item.stock});
			if(item.stock==0){
				$('[data-plugin="touchSpin"]').val(0);
			}
		}
	});
	if($('#stock-num').hasClass('hide')) $('#stock-num').removeClass('hide');
	stock_vild();
}
function stock_vild(){
	$('.selectpara').removeClass('disabled');
	$.each(stockjson, function(i, item){
		if(item.stock==0){
			var val = item.valuelist;
			val = val.split(',');
			if(val.length==1){
				$('.selectpara[data-val="'+val[0]+'"]').removeClass('btn-danger').addClass('disabled');
			}
			if(val.length==2){
				if($('.selectpara[data-val="'+val[0]+'"]').hasClass('btn-danger')){
					$('.selectpara[data-val="'+val[1]+'"]').removeClass('btn-danger').addClass('disabled');
				}else{
					if($('.selectpara[data-val="'+val[1]+'"]').hasClass('btn-danger')){
						$('.selectpara[data-val="'+val[0]+'"]').removeClass('btn-danger').addClass('disabled');
					}
				}
			}
			if(val.length==3){

			}
		}
	});
}
/*右上角购物车*/
function laodtopcart(d){
	$("#topcart-body").html('<div class="height-100 vertical-align text-center cart-loader"><div class="loader vertical-align-middle loader-default"></div></div>');
	laodcartjson(function(json){
		var html = '',num=0;
		$.each(json, function(i, item){
			item.shopmax = item.purchase>0?item.purchase:item.stock;
			html += '<div class="list-group-item" role="menuitem">'+
						'<div class="media">'+
							'<div class="media-left padding-right-10">'+
								'<a class="avatar text-middle" target="_blank" href="'+item.url+'">'+
									'<img class="img-responsive" src="'+item.img+'" alt="">'+
								'</a>'+
							'</div>'+
							'<div class="media-body">'+
								'<div class="pull-right text-right">'+
									'<span>'+item.price_str+' x '+item.amount+'</span>'+
									'<p><a href="'+delurl+'&id='+item.id+'" class="topcartremove"><i class="icon wb-trash" aria-hidden="true"></i></a></p>'+
								'</div>'+
								'<h6 class="media-heading font-weight-unset">'+
									'<a target="_blank" href="'+item.url+'">'+
										item.name+
									'</a>'+
								'</h6>'+
								'<p>'+item.para_str+'</p>'+
							'</div>'+
						'</div>'+
					'</div>';
			num++;
		})
		if(html==''){
			html='<div class="height-100 text-center vertical-align"><div class="vertical-align-middle">'+lang_emptycart+'</div></div>';
			$('.dropdown-menu-footer').hide();
		}
		$("#topcart-body").parent('.scrollable-container').height('auto');
		$('.topcart-goodnum').html(num).removeClass('hide');
		$("#topcart-body").html(html);
		topcarttotal();
		$('.topcartremove').click(function(e){ e.preventDefault(); topcartremove($(this)); });
		$('.dropdown-menu-footer-btn a,#topcart-body .media-heading a,#topcart-body .media-left a').click(function(e){ window.location.href = $(this).attr('href'); });
	},d);
}
/*购物车价格*/
function topcarttotal() {
	$.ajax({
		url: totalurl,
		type: "GET",
		cache: false,
		dataType: "jsonp",
		success: function(data) {
			if (data.message == 'ok') {
				$('.topcarttotal').html(data.price.goods.total_str);
			}
		}
	});
}
//
function topcartremove(dom){
	$.ajax({
		url: dom.attr('href'),
		type: 'POST',
		dataType:'json',
		success: function(data) {
			if(data.error){
				alertify.error(data.error);
			}else if(data.success){
				alertify.success(data.success);
				laodtopcart('new');
			}
		}
	});
}
/*购物车数据*/
function laodcartjson(func,d){
	if(typeof(cartjson) == "undefined"||d=='new'){//避免重复获取数据
		$.ajax({
			url: jsonurl,
			type: 'POST',
			dataType:'json',
			success: function(json) {
				window.cartjson = json;//赋值全局变量
				func(json);
			}
		});
	}else{
		func(cartjson);
	}
}