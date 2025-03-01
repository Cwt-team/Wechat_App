package com.zking.ssm.wxcontroller;
 
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
 
import com.zking.ssm.annotation.LoginUser;
import com.zking.ssm.model.WxUser;
import com.zking.ssm.service.UserTokenManager;
import com.zking.ssm.service.WxUserService;
import com.zking.ssm.util.ResponseUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
 
import com.alibaba.fastjson.JSONObject;
 
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
 
 
/**
 * 用户服务
 */
@Slf4j
@RestController
@RequestMapping("/wx/user")
@Validated
public class WxUserController {
	@Autowired
	private WxUserService userService;
 
	/**
	 * 用户个人页面数据
	 * <p>
	 * @param userId
	 *            用户ID
	 * @return 用户个人页面数据
	 */
	@GetMapping("index")
	public Object list(@LoginUser Integer userId, @RequestHeader("X-OA-token") String token) {
		log.info("【请求开始】用户个人页面数据,请求参数,userId:{}", userId);
		log.info("【请求开始】用户个人页面数据,请求参数,token:{}", token);
		if (userId == null) {
			log.error("用户个人页面数据查询失败:用户未登录！！！");
			return ResponseUtil.unlogin();
		}
		WxUser wxUser = userService.selectByPrimaryKey(userId);
		Map<Object, Object> data = new HashMap<Object, Object>();
		data.put("metting_pubs", wxUser.getUserLevel());
		data.put("metting_joins",wxUser.getUserLevel());
		return ResponseUtil.ok(data);
	}
 
}