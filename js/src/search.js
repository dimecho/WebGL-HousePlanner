/*
http://www.techdezire.com/ajax-autocomplete-php-jquery-mysql/
*/
$(document).ready(function(){
	var timer = null;
	$('#search-box').keyup(function(e){
		
		if( e.keyCode === 38 ){
			if( $('#search_suggestion_holder').is(':visible') ){
				if( ! $('.selected').is(':visible') ){
					$('#search_suggestion_holder li').last().addClass('selected');
				}else{
					var i =  $('#search_suggestion_holder li').index($('#search_suggestion_holder li.selected')) ;
					$('#search_suggestion_holder li.selected').removeClass('selected');
					i--;
					$('#search_suggestion_holder li:eq('+i+')').addClass('selected');
					
				}
			}
		}else if(e.keyCode === 40){
			if( $('#search_suggestion_holder').is(':visible') ){
				if( ! $('.selected').is(':visible') ){
					$('#search_suggestion_holder li').first().addClass('selected');
				}else{
					var i =  $('#search_suggestion_holder li').index($('#search_suggestion_holder li.selected')) ;
					$('#search_suggestion_holder li.selected').removeClass('selected');
					i++;
					$('#search_suggestion_holder li:eq('+i+')').addClass('selected');
				}
			}					
		}else if(e.keyCode === 13){
			if( $('.selected').is(':visible') ){
				var value	=	$('.selected').text();
				$('#search-box').val(value);
				$('#search_suggestion_holder').hide();
			}
		}else{
			var keyword	= $(this).val();
			$('#search-close').hide();
			$('#loader').show();
			setTimeout( function(){
				$.ajax({
					url:'php/search.php',
					data:'keyword='+keyword,
					success:function(data){
						$('#search_suggestion_holder').html(data);
						$('#search_suggestion_holder').show();
						$('#loader').hide();
						$('#search-close').show();
					}
				});
			},400);
		}
	});
	
	$('#search_suggestion_holder').on('click','li',function(){
		//var value	=	$(this).text();
		//$('#search-box').val(value);
		$('#search_suggestion_holder').hide();
	});
	
});
